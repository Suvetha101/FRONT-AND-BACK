const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const mongoURI = 'mongodb+srv://suvethas:suve111@cluster0.4m8hr.mongodb.net/';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Error connecting to MongoDB:', err));

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Blog = mongoose.model('Blog', blogSchema);
const Comment = mongoose.model('Comment', commentSchema);

app.post('/posts', async (req, res) => {
    const { title, content } = req.body;

    try {
        const blog = new Blog({ title, content });
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/posts/:id', async (req, res) => {
    const { title, content } = req.body;

    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!blog) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/posts/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await Comment.deleteMany({ postId: req.params.id });
        res.status(200).json({ message: 'Post and associated comments deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/posts/:id/view', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!blog) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/posts/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/posts/:id/comments', async (req, res) => {
    const { content } = req.body;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = new Comment({ postId: req.params.id, content });
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});