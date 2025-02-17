const express = require('express')
const { buildSchema } = require("graphql")
const { graphqlHTTP } = require("express-graphql")
const mongoose = require('mongoose')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Employee = require('./models/Employee');
const User = require('./models/User');

const app = express()

const SERVER_PORT = 4000;
const MONGO_URI = process.env.MONGO_URI;

const gqlSchema = buildSchema( 
    `
    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        created_at: String
        updated_at: String
    }

    type Employee {
        _id: ID!
        first_name: String!
        last_name: String!
        email: String!
        gender: String
        designation: String
        salary: Float
        date_of_joining: String
        department: String
        created_at: String!
        updated_at: String!
    }

    type AuthData {
        userId: ID!
        token: String!
    }

    type Query {
        login(email: String!, password: String!): AuthData
        getAllEmployees: [Employee]
        getEmployeeById(id: ID!): Employee
        searchEmployeeByDesignation(designation: String): [Employee]
        searchEmployeeByDepartment(department: String): [Employee]
    }

    type Mutation {
        signup(username: String!, email: String!, password: String!): User
        addEmployee(first_name: String!, last_name: String!, email: String!, gender: String!, designation: String!, salary: Float!, date_of_joining: String!, department: String!, employee_photo: String): Employee
        updateEmployee(id: ID!, first_name: String, last_name: String, email: String, designation: String, salary: Float, date_of_joining: String, department: String): Employee
        deleteEmployee(id: ID!): String
    }
    `
)

const rootResolver = {
    signup: async ({ username, email, password }) => {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) throw new Error('User already exists');
    
            const user = new User({ username, email, password });
            const newUser = await user.save();
    
            return { ...newUser._doc, password: null };
        } catch (error) {
            throw error;
        }
    },

    login: async ({ email, password }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
    
        console.log("🔍 Stored Password: ", user.password);
        console.log("🔍 Entered Password: ", password);
    
        if (password !== user.password) {
            console.log("Password incorrect!");
            throw new Error('Invalid credentials');
        }
    
        console.log("Password matched!");
    
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        return { userId: user.id, token };
    },

    getAllEmployees: async () => {
        return await Employee.find()
    },

    getEmployeeById: async ({ id }) => {
        return await Employee.findById(id)
    },

    searchEmployeeByDesignation: async ({ designation }) => { 
        return await Employee.find({ designation })
    },

    searchEmployeeByDepartment: async ({ department }) => {
        return await Employee.find({ department })
    },

    addEmployee: async (args) => {
        const newEmployee = new Employee(args);
        return await newEmployee.save();
    },

    updateEmployee: async ({ id, ...args }) => {
        return await Employee.findByIdAndUpdate(id, args, { new: true });
    },

    deleteEmployee: async ({ id }) => {
        await Employee.findByIdAndDelete(id);
        return "Employee deleted successfully!";
    }
}

const graphqlHttp = graphqlHTTP({
    schema: gqlSchema,
    rootValue: rootResolver,
    graphiql: true
})

app.use("/graphql", graphqlHttp)

const connectDB = async() => {
    try {
        console.log("Attempting to connect to DB")
        mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        }).then(() => console.log('Succesful MongoDB Connection'))
        .catch(err => console.log('MongoDB Connection Error:', err));
    }
    catch (error) {
        console.log(`Unable to connect to DB: ${error.message}`)
    }
}

app.listen(SERVER_PORT, () => {
    connectDB()
    console.log(`Server running on port ${SERVER_PORT}`)
    console.log("http://localhost:4000/graphql")
});