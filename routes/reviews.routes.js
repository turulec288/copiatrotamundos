const router = require("express").Router();
const Review = require("../models/Review.model");
const User = require("../models/User.model");
const { isLoggedIn } = require("../middlewares/route-guard");

// Mostrar todas mis reviews
router.get("/", isLoggedIn, async (req, res, next) => {
  console.log(req.session.currentUser._id);
  const reviews = await Review.find({
    userId: req.session.currentUser._id,
  });
  res.render("myReviews", {
    reviews: reviews,
    users: req.session.currentUser,
  });
});

// Formulario de crear una nueva review
router
  .get("/new", isLoggedIn, (req, res, next) => {
    console.log(req.params);
    res.render("reviewNew", { experience: req.params.experienceId });
  })
  .post("/new", isLoggedIn, async (req, res) => {
    const { title, rating, comment, filtro } = req.body;

    Review.create({
      userId: req.session.currentUser._id,
      experienceId: req.params.experienceId,
      title,
      rating,
      comment,
    })
      .then(() => res.redirect("/")) //crear
      .catch((err) => console.log(err));
  });

// Mostrar una experiencia en concreto
router.get("/:reviewId", isLoggedIn, async (req, res, next) => {
  const review = await Review.findById({
    reviewId: req.params.reviewId,
  });
  res.render("reviewDetails", {
    review: review,
    users: req.session.currentUser,
  });
});

//vacio /reviewDetails
module.exports = router;
