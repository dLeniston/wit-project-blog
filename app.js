var express           = require("express"),
Blog                  = require("./models/blog"),
User                  = require("./models/user"),
flash                 = require("connect-flash"),
passport              = require("passport"),
bodyParser            = require("body-parser"),
mongoose              = require("mongoose"),
localStrategy         = require("passport-local"),
methodOverride        = require("method-override"),
expressSanitizer      = require("express-sanitizer"),
passportLocalMongoose = require("passport-local-mongoose");

var app = express();

mongoose.connect("mongodb://localhost/project_blog_app_V2");

app.use(require("express-session")({
    secret: "X92 GGAAKS DJSDAA",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(expressSanitizer());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//====================================//
//              ROUTES                //
//====================================//

app.get("/", function(req, res){
    res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error");
        }else{
            res.render("index", {blogs: blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", isLoggedIn, function(req, res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", isLoggedIn, function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            //redirect to index
            req.flash("success", "Blog Post Created");
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    })
});

//EDIT ROUTE
app.get("/blogs/:id/edit", isLoggedIn, function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", isLoggedIn, function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            req.flash("success", "Blog Post Updated");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", isLoggedIn, function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            req.flash("error", "Blog Post Deleted");
            res.redirect("/blogs");
        }
    });
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/blogs");
        })
    });
})
//LOGIN ROUTES
app.get("/login", function(req, res){
    res.render("login");
});

//login middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
}), function(req, res){
});

//logout
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged Out");
    res.redirect("/blogs");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Permission Denied");
    res.redirect("/blogs");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER STARTED");
});