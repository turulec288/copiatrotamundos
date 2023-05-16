const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;

// Signup
router.get("/registro", (req, res, next) => res.render("auth/signup"));
router.post("/registro", (req, res, next) => {
  const { userPwd } = req.body;

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(userPwd, salt))
    .then((hashedPassword) =>
      User.create({ ...req.body, password: hashedPassword })
    )
    .then((createdUser) => res.redirect("/"))
    .catch((error) => next(error));
});

// Login

const { isLoggedIn, checkRole } = require("../middlewares/route-guard");

router.get("/iniciar-sesion", isLoggedIn, async (req, res, next) => {
  try {
    // const users = await Users.find();
    res.redirect("/");
  } catch (error) {
    res.render("auth/login");
  }
});

router.post("/iniciar-sesion", (req, res, next) => {
  const { email, userPwd } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        // res.render("auth/login", {
        //   errorMessage: "Email no registrado en la Base de Datos",
        // });

        res.redirect("/registro");
        return;
      } else if (bcrypt.compareSync(userPwd, user.password) === false) {
        res.render("auth/login", {
          errorMessage: "La contraseña es incorrecta",
        });
        return;
      } else {
        req.session.currentUser = user;
        res.redirect("/");
      }
    })
    .catch((error) => next(error));
});

// Logout
router.post("/cerrar-sesion", (req, res, next) => {
  req.session.destroy(() => res.redirect("/iniciar-sesion"));
});

module.exports = router;
