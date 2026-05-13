const express = require('express');
const router  = express.Router();
const Todo    = require('../models/Todo');

// GET all todos (newest first)
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a todo
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  try {
    const todo = new Todo({ title, description: description || '' });
    const saved = await todo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a todo (title and/or completed)
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found.' });

    if (req.body.title       != null) todo.title       = req.body.title;
    if (req.body.description != null) todo.description = req.body.description;
    if (req.body.completed   != null) todo.completed   = req.body.completed;

    const updated = await todo.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a todo
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found.' });
    await todo.deleteOne();
    res.json({ message: 'Todo deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
