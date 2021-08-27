let token, userId;
//const twitch = window.Twitch.ext;
const twitch = window.Twitch.ext;
var ddgName;
window.Twitch.ext.configuration.onChanged(() => {
    var broadcaster = window.Twitch.ext.configuration.broadcaster;
    console.log(broadcaster);
    if (broadcaster) {
        if (broadcaster.content) {
            var config = {};
            try {
                config = JSON.parse(broadcaster.content);
                document.getElementById('ddgName').value = config[0];
                document.getElementById('debugtext').innerHTML = config;
            } catch (e) {
                console.log(e);
            }
        }
    }
});
twitch.onContext((context) => {
  twitch.rig.log(context);
});

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
});

function updateConfig(options) {
  console.log(options);
  console.log(userId)
  window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify(options));
  console.log(window.Twitch.ext.configuration);
}

function submitConfig(){
    var formData = document.getElementById('ddgName');
    var ddgName = formData.value;
    var options = [];
    console.log(ddgName);
    options.push(ddgName);
    updateConfig(options);
}

