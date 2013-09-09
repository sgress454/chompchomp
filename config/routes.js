var _ = require('lodash');
/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/**
 * (1) Core middleware
 *
 * Middleware included with `app.use` is run first, before the router
 */


/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */

module.exports.routes = {

  // '/*': {cors:function(sails){return sails.config.serverName;}, middleware: function(req, res, next) {next();}},
  // 'options /*': {cors:function(sails){return sails.config.serverName;}, middleware: function(req, res, next) {res.send(200);}},
  '/reloadRoutes': {controller:'router', action:'reload'},
  '/session': {middleware: function(req, res, next) {res.header("Content-type", "application/javascript"); res.send("startSession();");}},
};

/* START_BUILDER_ROUTES */
_.extend(module.exports.routes, {"get /user":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"user\\\":\\\"=s(user)\\\"}"}},"exits":{}},"post /login":{"id":"Look_up_user","middleware":"data.findOne","inputs":{"model":{"origin":"literal","value":"player"},"where":{"origin":null},"criteria:username":{"origin":"param","key":"username"},"criteria:password":{"origin":"param","key":"password"}},"exits":{"success":{"id":"Log_User_In","middleware":"data.remember","inputs":{"flash":{"origin":null},"key:user":{"origin":"middleware_data","middleware":"Look_up_user"}},"exits":{"success":{"id":"Output_JSON_1","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":true}"}},"exits":{}}}},"notFound":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":false, \\\"test\\\":123}"}},"exits":{}}}},"get /logout":{"id":"Log_Out","middleware":"auth.logout","inputs":null,"exits":{"success":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":true}"}},"exits":{}}}},"post /signup":{"id":"Create","middleware":"data.createModel","inputs":{"model":{"origin":"literal","value":"player"},"data":{"origin":null},"model_property:name":{"origin":"param","key":"name"},"model_property:email":{"origin":"param","key":"email"},"model_property:password":{"origin":"param","key":"password"}},"exits":{"success":{"id":"Remember","middleware":"data.remember","inputs":{"flash":{"origin":"literal","value":false},"key:user":{"origin":"middleware_data","middleware":"Create"}},"exits":{"success":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"literal","value":"{\\\"success\\\":true}"}},"exits":{}}}},"error":{"id":"Output_JSON_1","middleware":"response.json","inputs":{"obj":{"origin":"literal","value":"{\\\"success\\\":false,\\\"errors\\\":\\\"=m(Create)\\\"}"}},"exits":{}}}},"get /play":{"id":"Display_View","middleware":"response.view","inputs":{"view":{"origin":"literal","value":"home/play.ejs"}},"exits":{}},"get /":{"id":"Display_View","middleware":"response.view","inputs":{"view":{"origin":"literal","value":"home/games.ejs"}},"exits":{}},"get /games":{"id":"Display_View","middleware":"response.view","inputs":{"view":{"origin":"literal","value":"home/games.ejs"}},"exits":{}},"post /game/new":{"middleware":"auth.check_login","id":"authorize_or_redirect__Check_Login_Status","exits":{"not_logged_in":{"middleware":"response.redirect","id":"authorize_or_redirect__Redirect","inputs":{"destination":{"origin":"literal","value":"/login"}},"bundle_id":"authorize_or_redirect","exits":{}},"success":{"middleware":"data.createModel","id":"Create","inputs":{"model":{"origin":"literal","value":"game"},"data":{"origin":"json","value":"{\\\"players\\\":[{\\\"name\\\":\\\"=s(user.name)\\\",\\\"id\\\":\\\"=s(user.id)\\\"}]}"}},"exits":{"success":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":true,\\\"gameId\\\":\\\"=m(Create.id)\\\"}"}},"exits":{}},"error":{"id":"Output_JSON_1","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":\\\"false\\\", \\\"test\\\":456}"}},"exits":{}}},"outer":true}},"bundle_id":"authorize_or_redirect"},"post /game/:id/join":{"id":"Find_Game_In_Progress","middleware":"data.findOne","inputs":{"model":{"origin":"literal","value":"game"},"where":{"origin":"json","value":"{\\\"id\\\":\\\"=p(id)\\\", \\\"players.id\\\":\\\"=s(user.id)\\\"}"}},"exits":{"notFound":{"id":"Find_Joinable_Game","middleware":"data.findOne","inputs":{"model":{"origin":"literal","value":"game"},"where":{"origin":"json","value":"{\\\"id\\\":\\\"=p(id)\\\",\\\"players.id\\\":{\\\"$nin\\\":[\\\"=s(user.id)\\\"]}}"}},"exits":{"success":{"id":"Check_Game_Not_Full","middleware":"math.test","inputs":{"variable":{"origin":"json","value":"\\\"=count(m(Find_Joinable_Game.players))\\\""},"test":{"origin":"json","value":"2"}},"exits":{"success":{"id":"Remember_Game_Full_Error","middleware":"data.remember","inputs":{"flash":{"origin":"literal","value":true},"key:error":{"origin":"json","value":"Game Full"}},"exits":{"success":{"id":"Output_JSON_2","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":false, \\\"user\\\":\\\"=s(user)\\\"}"}},"exits":{}}}},"fail":{"id":"Join_Game","middleware":"data.update","inputs":{"model":{"origin":"literal","value":"game"},"where":{"origin":"json","value":""},"update":{"origin":"json","value":"{\\\"$push\\\":{\\\"players\\\":{\\\"id\\\":\\\"=s(user.id)\\\",\\\"name\\\":\\\"=s(user.name)\\\"}}}"},"criteria:id":{"origin":"param","key":"id"}},"exits":{"success":{"id":"Remember_Game_ID_2","middleware":"data.remember","inputs":{"flash":{"origin":null},"key:currentGame":{"origin":"param","key":"id"}},"exits":{"success":{"id":"Output_JSON_1","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":true}"}},"exits":{}}}}}}}}}},"success":{"id":"Remember_Game_ID","middleware":"data.remember","inputs":{"flash":{"origin":null},"key:currentGame":{"origin":"param","key":"id"}},"exits":{"success":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":true}"}},"exits":{}}}}}},"post /game/:id/move":{"id":"Find_One","middleware":"data.findOne","inputs":{"model":{"origin":"literal","value":"game"},"where":{"origin":"json","value":"{\\\"id\\\":\\\"=p(id)\\\",\\\"players.id\\\":\\\"=s(user.id)\\\""}},"exits":{"success":{"id":"Update","middleware":"data.update","inputs":{"model":{"origin":"literal","value":"game"},"where":{"origin":null},"update":{"origin":"json","value":"{\\\"$push\\\":{\\\"moves\\\",\\\"=p(move)\\\"}}"},"criteria:id":{"origin":"param","key":"id"}},"exits":{"error":{"id":"Output_JSON_1","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":false}"}},"exits":{}},"success":{"id":"Output_JSON_2","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":"}},"exits":{}}}},"notFound":{"id":"Output_JSON","middleware":"response.json","inputs":{"obj":{"origin":"json","value":"{\\\"success\\\":false}"}},"exits":{}}}},"get /login":{"id":"Display_View","middleware":"response.view","inputs":{"view":{"origin":"literal","value":"home/login.ejs"}},"exits":{}},"get /signup":{"id":"Display_View","middleware":"response.view","inputs":{"view":{"origin":"literal","value":"home/signup.ejs"}},"exits":{}}});
/* END_BUILDER_ROUTES */

