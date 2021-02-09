/*global io*/
/*jslint browser: true*/
var socket = io();
var i;

/*** Fonctions utiles ***/

/**
 * Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
 */
function scrollToBottom() {
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
    $('html, body').animate({ scrollTop: $(document).height() }, 0);
  }
}

/*** Gestion des événements ***/

/**
 * Connexion de l'utilisateur
 * Uniquement si le username n'est pas vide et n'existe pas encore
 */
$('#login form').submit(function (e) {
  e.preventDefault();
  var user = {
    username : $('#login input').val().trim()
  };
  if (user.username.length > 0) { // Si le champ de connexion n'est pas vide
    socket.emit('user-login', user, function (success) {
      if (success) {
        $('body').removeAttr('id'); // Cache formulaire de connexion
        $('#chat input').focus(); // Focus sur le champ du message
      }
    });
  }
});


/**
 * Envoi d'un message
 */
$('#chat form').submit(function (e) {
  e.preventDefault();
  var message = {
    text : $('#m').val()
  };
  $('#m').val('');
  if (message.text.trim().length !== 0) { // Gestion message vide
    socket.emit('chat-message', message);
  }
  $('#chat input').focus(); // Focus sur le champ du message
});

/**
 * Réception d'un message
 */
socket.on('chat-message', function (message) {
  $('.contentMsg').append(`<div class="message">
    <div class="avatar">
      <img src="https://images.unsplash.com/photo-1533264515790-38b563064b68?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ" alt>
    </div>
    <div class="content-wrapper">
      <div class="details">
        <a href="#" class="name">${message.username}</a>
        <div class="date">Today at 09:45</div>
      </div>
      <div class="content"> 
      ${message.text} 
      </div>
    </div>
    </div>`);

  scrollToBottom();
});

/**
 * Réception d'un message de service
 */
socket.on('service-message', function (message) {
  $('.contentMsg').append(`<div class="message">
  <div class="content-wrapper">
    <div class="details">
      <div class="date">Today at 09:45</div>
    </div>
      <div class="content">
          ${message.text}
      </div>
  </div>
</div>`);
  
  scrollToBottom();
});

/**
 * Connexion d'un nouvel utilisateur
 */
socket.on('user-login', function (user) {
  $('.nameo').html(`${user.username}`);
  // .html(user.username + '<span class="typing"> typing...</span>'))
  setTimeout(function () {
    $('#users li.new').removeClass('new');
  }, 1000);
});

/**
 * Déconnexion d'un utilisateur
 */
socket.on('user-logout', function (user) {
  var selector = '#users li.' + user.username;
  $(selector).remove();
});

/**
 * Détection saisie utilisateur
 */
var typingTimer;
var isTyping = false;

$('#m').keypress(function () {
  clearTimeout(typingTimer);
  if (!isTyping) {
    socket.emit('start-typing');
    isTyping = true;
  }
});

$('#m').keyup(function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () {
    if (isTyping) {
      socket.emit('stop-typing');
      isTyping = false;
    }
  }, 500);
});

/**
 * Gestion saisie des autres utilisateurs
 */
socket.on('update-typing', function (typingUsers) {
  $('#users li span.typing').hide();
  for (i = 0; i < typingUsers.length; i++) {
    $('#users li.' + typingUsers[i].username + ' span.typing').show();
  }
});