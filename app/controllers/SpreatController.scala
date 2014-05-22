package controllers

import play.api.mvc.Controller
import play.api.mvc.Action
import views.html.main

object SpreatController extends Controller {

  def index = Action { implicit request =>
    Ok(main("Hello World!"))
  }

}