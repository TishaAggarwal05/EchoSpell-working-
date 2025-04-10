// const express = require("express");
// const passport = require("passport");

// const router = express.Router();
// app.post('/login', (req, res, next) => {
//     passport.authenticate("local", (err, user, info) => {
//         if (err) return next(err);
//         if (!user) {
//             req.flash("error", info.message);
//             res.render('login', { messages: { error: req.flash("error") || [] } });
//         }
        
//         req.login(user, (err) => {
//             if (err) return next(err);
//             return res.redirect(`/user/profile/${user._id}`); 
//         });
//     })(req, res, next);
// });




// Logout Route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) console.error(err);
        res.redirect("/");
    });
});



module.exports = router;