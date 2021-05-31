const joi =require('@hapi/joi');
const regiesterValidation=(data)=>{
    const schema = {
    name: joi.string().min(6).required(),
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
    };
   return  joi.validate(data, schema);
}

const loginValidation= data =>{
    const schema = {
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
    };
   return  joi.validate(data, schema);
}


module.exports.regiesterValidation = regiesterValidation;
module.exports.loginValidation = loginValidation;