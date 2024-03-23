document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Select the form and attach the submit event listener
  document.querySelector('#compose-form').addEventListener('submit', send_email);

    // By default, load the sent inbox
    load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply(email) { 
  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: "${email.body}".`;
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const mailbox_name = mailbox;
  const url = '/emails/'.concat(mailbox_name);
  fetch(url)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // // Set up headers
      const h_row = document.createElement('div');
      h_row.classList.add('row');
      h_row.classList.add('mt-4');
      h_row.classList.add('mb-2');

      const h_time = document.createElement('div');
      h_time.classList.add('col-4');
      h_time.classList.add('bold');
      h_time.classList.add('m-1');
      h_time.innerHTML = "Time";

      const h_sender = document.createElement('div');
      h_sender.classList.add('col-4');1
      h_sender.classList.add('bold');
      h_sender.classList.add('m-1');
      h_sender.innerHTML = "Sender";

      const h_subject = document.createElement('div');
      h_subject.classList.add('col-3');
      h_subject.classList.add('m-1');
      h_subject.classList.add('bold');
      h_subject.innerHTML = "Subject";

      h_row.appendChild(h_time);
      h_row.appendChild(h_sender);
      h_row.appendChild(h_subject);
      document.querySelector('#emails-view').append(h_row);

      // ... do something else with emails ...
      emails.forEach(element => {
        const row = document.createElement('div');
        row.classList.add('row');
        row.classList.add('border');

        const time = document.createElement('div');
        time.innerHTML = element.timestamp;
        time.classList.add('col-4');
        time.classList.add('m-1');

        const sender = document.createElement('div');
        sender.innerHTML = element.sender;
        sender.classList.add('col-4');
        sender.classList.add('m-1');

        const subject = document.createElement('div');
        subject.classList.add('col-3');
        subject.classList.add('m-1');
        subject.innerHTML = element.subject;

        row.appendChild(time);
        row.appendChild(sender);
        row.appendChild(subject);
        // row.addEventListener('click', function() {
        //   console.log(`Email #${element.id}  has been clicked!`)
        // });
        row.addEventListener('click', () => view_email(element));

        if (element.read == true) {
          row.classList.add('read');
        }
        else {
          row.classList.add('unread');
        };

        document.querySelector('#emails-view').append(row);
      });

  });
}

function view_email(email) {
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the email Subject
  document.querySelector('#email-view').innerHTML = `<h3>${email.subject}</h3>`;

  // Mark email as read
  const url = '/emails/'.concat(email.id)
  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  fetch(url)
  .then(response => response.json())
  .then(email => {
      // Show email
      const sender = document.createElement('div');
      sender.innerHTML = `<b>From:</b> ${email.sender}`;
      sender.classList.add('pad-small');

      // Create recipients HTML element
      const recipients = document.createElement('div');
      const recip_list = email.recipients;
      let str_rec = '';
      if (recip_list.length !== 1) {
        str_rec = '';
        for (i=0; i < recip_list.length; i++){
            if (i ==0 ) {
              str_rec += `${String(recip_list[i])}`;
            } else {
              str_rec += `, ${String(recip_list[i])}`;
            }
        }
      } else {
         str_rec = recip_list[0];
      };
      recipients.innerHTML = `<b>To:</b> ${str_rec}`;
      recipients.classList.add('pad-small');
      
      // Create timestamp HTML element
      const timestamp = document.createElement('div');
      timestamp.innerHTML = `<b>When:</b> ${email.timestamp}`;
      timestamp.classList.add('pad-small');

      // Create message HTML element
      const body = document.createElement('div');
      body.innerHTML = email.body;
      body.classList.add('border');
      body.classList.add('padded');
      body.classList.add('margin');

      // Create archive button
      const button = document.createElement('div');
      if (email.archived == false) {
        button.innerHTML = '<button type="button">Archive</button>';
      } else {
        button.innerHTML = '<button type="button">Unarchive</button>';
      }
      button.classList.add('pad-small');
      button.addEventListener('click', () => archive(email));

      // Create reply button
      const replyButton = document.createElement('div');
      replyButton.innerHTML = '<button type="button">Reply</button>';
      replyButton.classList.add('pad-small');
      replyButton.addEventListener('click', () => reply(email));

      // Append new HTML elements
      document.querySelector('#email-view').append(sender);
      document.querySelector('#email-view').append(recipients);
      document.querySelector('#email-view').append(timestamp);
      document.querySelector('#email-view').append(body);
      document.querySelector('#email-view').append(button);
      document.querySelector('#email-view').append(replyButton);
      document.querySelector('#email-view').classList.add('border');
      document.querySelector('#email-view').classList.add('padded');
  });
}

function send_email(event) {
  event.preventDefault();
  const recip = document.querySelector('#compose-recipients').value;
  const title = document.querySelector('#compose-subject').value;
  const msg = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recip,
        subject: title,
        body: msg
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        // Load the sent mailbox
        load_mailbox('sent');
    })
    .catch(error => {
      console.error('Error:', error);
  });
}

function archive(email) {
  // Define url
  const url = '/emails/'.concat(email.id);
  // archive / unarchive email
  if (email.archived == false) {
      fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        }) 
        // Refresh inbox
      }).then(() => load_mailbox('inbox'));
  } else {
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    }).then(() => load_mailbox('inbox'));
  }
}