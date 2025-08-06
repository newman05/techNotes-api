const allowedOrigins = require('./allowedOrigin') ; 

const corsOptions = {
  origin: (origin , callback) => {
    if(allowedOrigins.includes(origin) || !origin ) {
      callback(null ,  true)
    } 
    else {
      callback(new Error('not allowed by CORS')) 
    }
  },
  credentials:true,
  optionsSuccessStatus: 200 
}

module.exports = corsOptions 