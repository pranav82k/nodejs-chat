const User = require('../models/User');
const jwt = require('jsonwebtoken');
const maxAge = 5 * 24 * 60 * 60; // 5 Days

const createJWT = id => {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {
        expiresIn: maxAge
    })
}

const alertError = (err) => {
    let errors = { name:'', email:'', password:'' };

    if(err.message === 'incorrect email') {
        errors.email = "Email does not found";
    }
    if(err.message === 'incorrect pwd') {
        errors.password = "Incorrect Password";
    }

    if(err.code === 11000) {
        errors.email = "This email already exist";
        return errors;
    }

    if(err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

module.exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        const token = createJWT(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user });
    } catch (error) {
        let errors = alertError(error);
        res.status(400).json({errors});
    }
}

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createJWT(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user });
    } catch (error) {
        let errors = alertError(error);
        res.status(400).json({errors});
    }
}

module.exports.verifyuser = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decodedToken) => {
            // console.log('decoded token', decodedToken);
            if(err) {
                console.log(err?.message);
            } else {
                let user = await User.findById(decodedToken.id);
                res.json({ user });
                next();
            }
        });
    } else {
        // res.status(401).json({ error: "Unauthorized Request" });
        console.log('No Token');
        next();
    }
}

module.exports.logout = (req, res) => {
    res.cookie("jwt", "", { maxAge:1 });
    res.status(200).json({ logout: true });
}