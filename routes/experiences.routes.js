const router = require("express").Router();
const Experience = require("../models/Experience.model");
const Review = require("../models/Review.model");
const { isLoggedIn } = require("../middlewares/route-guard");
const uploader = require("../config/claudinary.config");

// Mostrar todas mis experiencias
router.get("/", isLoggedIn, async (req, res, next) => {
  console.log(req.session.currentUser._id);
  const experiences = await Experience.find({
    userId: req.session.currentUser._id,
  });

  res.render("myExperiences", {
    experiences: experiences,
    user: req.session.currentUser,
  });
});

// Formulario de crear una nueva experiencia

router.get("/new", isLoggedIn, (req, res, next) => {
  res.render("experienceNew", { user: req.session.currentUser });
});

router.post("/new", isLoggedIn, uploader.single("imagen"), async (req, res) => {
  const { titulo, texto, imagen, filtro } = req.body;
  console.log(req.file);
  let image = undefined
  if (req.file){
     image = req.file.path
  }
  Experience.create({
    titulo,
    texto,
    imagen: image,
    filtro,
    userId: req.session.currentUser._id,
  })
    .then(() => res.redirect("/myExperiences"))
    .catch((err) => console.log(err));
});

// Mostrar una experiencia en concreto
router
  .get("/:id", isLoggedIn, async (req, res, next) => {
    const experience = await Experience.findOne({
      _id: req.params.id,
    });
    const reviews = await Review.find({
      experienceId: req.params.id,
    });

    res.render("experienceDetails", {
      user: req.session.currentUser,
      reviews: reviews,
      experience: experience,
    });
  })
  .post("/:id", isLoggedIn, (req, res, next) => {
    //
  })
  .post("/:id/delete", isLoggedIn, async (req, res, next) => {
    const { deletedCount, acknowledged } = await Experience.deleteOne({
      _id: req.params.id,
    });

    if (deletedCount) {
      res.redirect("/myExperiences");
    } else {
      res.status(500).render("Experience not found");
    }
  });

router.get("/:id/edit", isLoggedIn, async (req, res, next) => {
  try {
    const experience = await Experience.findOne({
      _id: req.params.id,
    });

    res.render("experienceEdit", {
      experience: experience,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, {
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      fecha: req.body.fecha,
      pais: req.body.pais,
    });
    res.redirect("/myExperiences");
  } catch (error) {
    next(error);
  }
});

// -- REVIEWS

// Mostrar todas mis reviews
router.get("/:id/reviews", isLoggedIn, async (req, res, next) => {
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
  .get("/:id/reviews/:reviewId/edit", isLoggedIn, async (req, res, next) => {
    const review = await Review.findById({
      _id: req.params.reviewId,
    });
    res.render("reviewEdit", { review: review });
  })
  .post("/:id/reviews/:reviewId/edit", isLoggedIn, async (req, res, next) => {
    const { title, rating, comment } = req.body;
    try {
      const review = await Review.findByIdAndUpdate(req.params.reviewId, {
        title: req.body.title,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      res.redirect("/myExperiences");
    } catch (error) {
      next(error);
    }
  });

// Formulario de crear una nueva review
router
  .get("/:id/reviews/new", isLoggedIn, (req, res, next) => {
    console.log(req.params);
    res.render("reviewNew", { experienceId: req.params.id });
  })
  .post("/:id/reviews/new", isLoggedIn, async (req, res) => {
    console.log(req.body);
    const { title, rating, comment } = req.body;

    Review.create({
      userId: req.session.currentUser._id,
      experienceId: req.params.id,
      title,
      rating,
      comment,
    })
      .then(() => res.redirect("/")) //crear
      .catch((err) => console.log(err));
  });

router.post(
  "/:id/reviews/:reviewId/delete",
  isLoggedIn,
  async (req, res, next) => {
    const { deletedCount } = await Review.deleteOne({
      _id: req.params.reviewId,
    });

    if (deletedCount) {
      //res.redirect("/myExperiences/" + req.params.id);
      res.redirect("/");
    } else {
      res.status(500).render("Experience not found");
    }
  }
);
// Mostrar una review en concreto
router.get("/:id/reviews/:reviewId", isLoggedIn, async (req, res, next) => {
  const review = await Review.findById({
    _id: req.params.reviewId,
  });
  res.render("reviewDetails", {
    review: review,
    experienceId: req.params.id,
    user: req.session.currentUser,
  });
});



module.exports = router;
