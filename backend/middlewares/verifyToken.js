import jwt from "jsonwebtoken"
import express from "express"


export const  verifyToken = async(req, res, next) => {
    let token = req.header('authorization');

    token = token.split(' ')[1]
    if(!token){
        return res.status(401).json({
            message: "unauthorized",
            status: false
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        console.log(error)
        res.status(400).json({msg: 'Token is not valid'})
    }
}