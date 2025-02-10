import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BlogPost = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentPostId, setCurrentPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentPostId) {
      try {
        await axios.put(`http://localhost:3000/posts/${currentPostId}`, { title, content });
        fetchPosts();
        setTitle('');
        setContent('');
        setCurrentPostId(null);
      } catch (error) {
        console.error('Error updating post', error);
      }
    } else {
      try {
        await axios.post('http://localhost:3000/posts', { title, content });
        fetchPosts();
        setTitle('');
        setContent('');
      } catch (error) {
        console.error('Error creating post', error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/posts/${id}`);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post', error);
    }
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setCurrentPostId(post.id);
  };

  return (
    <div>
      <h1>Blog Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">
          {currentPostId ? 'Update Post' : 'Create Post'}
        </button>
      </form>

      <h2>All Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <button onClick={() => handleEdit(post)}>Edit</button>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogPost;


