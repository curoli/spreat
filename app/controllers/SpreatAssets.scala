package controllers

import play.mvc.Controller

object SpreatAssets extends Controller {
  
  def at(path:String, file:String) = Assets.at(path, mapFile(file))
  
  def mapFile(file:String) : String = fileMap.getOrElse(file, file)
  
  val fileMap = Map("javascripts/jquery.js" -> "javascripts/jquery-1.11.1.js")

}