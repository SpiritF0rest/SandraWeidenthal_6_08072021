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
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(400).json({ error : "Unauthorized request." })
            }
            else if (sauce.userId == req.auth.userId) {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    const sauceObject = req.file ?
                        {
                            ...JSON.parse(req.body.sauce),
                            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
                        } : { ...req.body };
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Sauce modified." }))
                        .catch(error => res.status(400).json({ error }));
                })
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(400).json({ error: "Unauthorized request." })
            }
            else if (sauce.userId == req.auth.userId) {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Sauce deleted." }))
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    const like = JSON.parse(req.body.like);
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        console.log(sauce);
        let likes = sauce.likes;
        let usersLiked = sauce.usersLiked;
        let dislikes = sauce.dislikes;
        let usersDisliked = sauce.usersDisliked;
        const usersLikedFilter = usersLiked.filter(user => user == req.body.userId);
        const usersDislikedFilter = usersDisliked.filter(user => user == req.body.userId);

        if (like === 1) {
            //code de mis à jour de la sauce pour les likes +1 et userLiked +userId
            likes++;
            usersLiked.push(req.body.userId);
            let updates = {
                likes : likes,
                usersLiked: usersLiked,
                _id: req.params.id,
            }
            Sauce.updateOne({ _id: req.params.id }, updates)
            .then(() => res.status(200).json({ message: "Like counted."}))
            .catch(error => res.status(400).json({ error }));

        } else if (like === -1) {
            //code de mis à jour de la sauce pour les dislikes +1 et userDisliked +userId
            dislikes++;
            usersDisliked.push(req.body.userId);
            let updates = {
                dislikes : dislikes,
                usersDisliked: usersDisliked,
                _id: req.params.id,
            }
            Sauce.updateOne({ _id: req.params.id }, updates)
            .then(() => res.status(200).json({ message: "Dislike counted."}))
            .catch(error => res.status(400).json({ error }));

        } else if (like === 0) {
            //on cherche l'id de l'user dans les tableaux pour le retirer et on retire 1 du total like ou dislike
            if (usersLikedFilter != "" ) {
                //on retire l'userId du tab usersLiked et on likes -1
                let positionLike = usersLiked.indexOf(req.body.userId);
                let newUsersLiked = usersLiked.splice(positionLike, 1);                
                likes--;
                let updates = {
                    likes : likes,
                    usersLiked: usersLiked,
                    _id: req.params.id,
                }
                Sauce.updateOne({ _id: req.params.id }, updates)
            .then(() => res.status(200).json({ message: "Like discounted."}))
            .catch(error => res.status(400).json({ error }));

            }else if (usersDislikedFilter != "") {
                 //on retire l'userId du tab usersDisliked et on dilikes -1
                 let positionDislike = usersDisliked.indexOf(req.body.userId);
                 let newUsersDisliked = usersDisliked.splice(positionDislike, 1);
                 dislikes--;
                 let updates = {
                    dislikes : dislikes,
                    usersDisliked: usersDisliked,
                    _id: req.params.id,
                }
                 Sauce.updateOne({ _id: req.params.id }, updates)
            .then(() => res.status(200).json({ message: "Like discounted."}))
            .catch(error => res.status(400).json({ error }));
            }
        }
    })
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