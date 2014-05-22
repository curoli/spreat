package spreat.controllers

import play.api.mvc.Controller
import play.api.mvc.Action

object SpreatController extends Controller {

  def index = Action { implicit request =>
    Ok("Hello World!")
  }

}