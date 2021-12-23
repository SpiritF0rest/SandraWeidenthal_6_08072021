const Sauce = require("../models/Sauce");
const fs    = require("fs");

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        userLiked: [],
        userDisliked: []
    });
    sauce.save()
    .then(() => res.status(201).json({ message: "Sauce saved."}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce modified."}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce deleted."}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
   Sauce.findOne({ _id: req.params.id })
    .then(object => {
        console.log(object);
        const likes = object.likes;
        const usersLiked = object.usersLiked;
        const dislikes = object.dislikes;
        const usersDisliked = object.usersDisliked;
       // likes.value = usersLiked.length;

    })
    .then(() => res.status(200).json({ message: "la route fonctionne."}))
    .catch(error => res.status(400).json({ error }));

/*Logique: 
-si le userId est dans le [] usersLiked il ne peut pas like donc ça retire le like
-pareil avec le [] usersDisliked
-si le userId n'est pas dans les [] alors ça ajoute +1 soit au like soit au dislike et ça push le userId dans le [] en question
-donc faut vérifier dans le body si l'id est dans un []
-s'il n'y est pas on push donc modifie le body
-s'il y est on le retire du [] en question et -1 au like ou dislike.
-NB: voir filter en js
*/       
};