import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors'
// import bcrypt from 'bcrypt';
import User from './model/user.js';
import { PORT, mongodbURL, jwtSecret } from './confi.js'; // Ensure jwtSecret is defined in confi.js

const app = express();

app.use(express.json());

app.use(cors());

// Endpoint to get all users

app.get('/', async (request, response) => {
    try {
        const usersList = await User.find({});
        return response.status(200).send(usersList);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Endpoint to create a new user signin

app.post('/signin', async (request, response) => {
    const { name, password,email } = request.body;

    try {
        if (!name || !password || !email) {
            return response.status(400).send({
                message: 'Send all required fields: name, password,email',
            });
        }

        const existingUser = await User.findOne({ name });

        if (existingUser) {
            return response.status(400).send({
                message: 'Username already exists',
            });
        }

        const newUser = new User({ name, password,email });

        const newUserCreated = await newUser.save();

        return response.status(201).send(newUserCreated);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Endpoint for user login

app.post('/login', async (request, response) => {
    const { name, password } = request.body;

    try {
        if (!name || !password) {
            return response.status(400).send({
                message: 'Send all required fields: name, password',
            });
        }

        const user = await User.findOne({ name });

        if (!user) {
            return response.status(400).send({
                message: 'Invalid username or password',
            });
        }

        const isMatch = password === user.password;

        if (!isMatch) {
            return response.status(400).send({
                message: 'Invalid username or password',
            });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '30' });

        return response.status(200).send({ token });

    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

mongoose
    .connect(mongodbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('App connected to database');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`App is listening to port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
