const express = require('express');
const category = require('@controllers/categoryController');

const router = express.Router();
router.post('/create', category.create);
router.get("/", category.get);
router.get("/:id", category.getbyId);
router.post("/update", category.update);
router.delete("/delete/:id", category.delete);

module.exports = router;