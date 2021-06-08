document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send-email').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  mails = document.querySelector('#emails-view')
  
  // Show the mailbox and hide other views
  mails.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';

  // Show the mailbox name
  mails.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      if (mailbox === 'sent') {
        emails.forEach(email => {
          const div = document.createElement('div')
          div.className = 'mail'
          div.addEventListener('click', () => {
            load_sent_mail(email.id)
          })
          div.innerHTML = `<b class="sender">${email.recipients}</b><span class="subject">${email.subject}</span><span class="time">${email.timestamp}</span>`
          console.log(div)
          mails.append(div)
        });
      } else {
        emails.forEach(email => {
          const div = document.createElement('div')
          div.className = 'mail'
          div.addEventListener('click', () => {
            load_received_mail(email.id)
          })
          div.dataset.id = `${email.id}`
          if (email.read) {
            div.style.backgroundColor = 'gray'
          }
          div.innerHTML = `<b class="sender">${email.sender}</b><span class="subject">${email.subject}</span><span class="time">${email.timestamp}</span>`
          console.log(div)
          mails.append(div)
        })
      }
  });
}

function send_email() {

  recipients = document.querySelector('#compose-recipients').value
  subject = document.querySelector('#compose-subject').value
  body = document.querySelector('#compose-body').value

  console.log(recipients, subject, body)

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  load_mailbox('sent');
}

function load_received_mail(id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      const recipients = email.recipients
      const subject = email.subject
      const timestamp = email.timestamp
      const sender = email.sender
      const body = email.body

      // ... do something else with email ...
      text = `<b>From: </b>${sender}<br><b>To: </b>${recipients} <br><b>Subject: </b>${subject} <br><b>Timestamp: </b>${timestamp}<br>`
      document.querySelector('#mail-view').innerHTML = text

      if (email.archived) {
        const unarchive = document.createElement('button')
        unarchive.innerHTML = 'Unarchive'
        unarchive.className = 'btn btn-sm btn-outline-primary'
        unarchive.addEventListener('click', () => {

          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          load_mailbox('inbox')
        })
        const reply = document.createElement('button')
        reply.innerHTML = 'Reply'
        reply.className = 'btn btn-sm btn-outline-primary'
        reply.onclick = (event) => {
          // Show compose view and hide other views
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#mail-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'block';

          // Clear out composition fields
          document.querySelector('#compose-recipients').value = recipients;
          if (!subject.length>=3) {
            document.querySelector('#compose-subject').value = 'Re: ' + subject;
          } else {
            if (subject.substring(0,4) === 'Re: '){
              document.querySelector('#compose-subject').value = subject;
            } else {
              document.querySelector('#compose-subject').value = 'Re: ' + subject;
            }
          }
          document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote:\n\t ${body}\n`;
        }
        document.querySelector('#mail-view').append(unarchive)
        document.querySelector('#mail-view').append(reply)
        hr = document.createElement('hr')
        document.querySelector('#mail-view').append(hr)
        document.querySelector('#mail-view').append(`${body}`)
      } else {
        const archive = document.createElement('button')
        archive.innerHTML = 'Archive'
        archive.className = 'btn btn-sm btn-outline-primary'
        archive.addEventListener('click', () => {

          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          load_mailbox('inbox')
        })
        const reply = document.createElement('button')
        reply.innerHTML = 'Reply'
        reply.className = 'btn btn-sm btn-outline-primary'
        reply.onclick = (event) => {
          // Show compose view and hide other views
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#mail-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'block';

          // Clear out composition fields
          document.querySelector('#compose-recipients').value = recipients;
          if (!subject.length>=3) {
            document.querySelector('#compose-subject').value = 'Re: ' + subject;
          } else {
            if (subject.substring(0,4) === 'Re: '){
              document.querySelector('#compose-subject').value = subject;
            } else {
              document.querySelector('#compose-subject').value = 'Re: ' + subject;
            }
          }
          document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote:\n\t ${body}\n`;
        }
        document.querySelector('#mail-view').append(archive)
        document.querySelector('#mail-view').append(reply)
        hr = document.createElement('hr')
        document.querySelector('#mail-view').append(hr)
        document.querySelector('#mail-view').append(`${body}`)
      }

      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
  });
}

function load_sent_mail(id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    sender = email.sender
    recipients = email.recipients
    subject = email.subject
    console.log(subject)
    timestamp = email.timestamp
    body = email.body

    // ... do something else with email ...
    text = `<b>From: </b>${sender}<br><b>To: </b>${recipients} <br><b>Subject: </b>${subject} <br><b>Timestamp: </b>${timestamp}<br>`
    document.querySelector('#mail-view').innerHTML = text
    const reply = document.createElement('button')
    reply.innerHTML = 'Reply'
    reply.className = 'btn btn-sm btn-outline-primary'
    reply.onclick = event => {
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#mail-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = recipients;
      if (!subject.length>=3) {
        document.querySelector('#compose-subject').value = 'Re: ' + subject;
      } else {
        if (subject.substring(0,4) === 'Re: '){
          document.querySelector('#compose-subject').value = subject;
        } else {
          document.querySelector('#compose-subject').value = 'Re: ' + subject;
        }
      }
      document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote:\n\t ${body}\n`;
    }
    document.querySelector('#mail-view').append(reply)
    hr = document.createElement('hr')
    document.querySelector('#mail-view').append(hr)
    document.querySelector('#mail-view').append(`${body}`)
  });
}