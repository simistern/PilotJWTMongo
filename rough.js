r.db("tutorialdb").table("superheroregistry").filter({
  "id" :req.body.id
}).update({
  "team" : req.body.team
}).then(function(){
  res.status(200).send("Line items updated successfully")
})
