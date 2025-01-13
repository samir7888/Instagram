const express = require('express');
const cors = require('cors');
import path from 'path';
import postRouter from './routes/post'
import userRouter from './routes/user'
import commentRouter from './routes/comment'
import profileRouter from './routes/profile';
const app = express();
app.use(cors())
app.use(express.json())
app.use('/api/user',userRouter);
app.use('/api/post',postRouter);
app.use('/api/comment',commentRouter);
app.use('/api/me',profileRouter)
app.use('/uploads', express.static('uploads'));

app.use('/uploads/profilePictures', express.static(path.join(__dirname, 'uploads/profilePictures')));

app.listen(3000,()=>{
    console.log("sever created")
})