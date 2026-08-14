const express = require("express");
const quotesController = require("../controllers/quotes.controller");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// El orden importa: /trash tiene que resolver antes que /:id para que
// "trash" no se interprete como un id.
router.get("/trash", quotesController.listTrash);
router.post("/:id/restore", quotesController.restore);
router.delete("/:id/permanent", quotesController.permanentDelete);

router.get("/", quotesController.list);
router.post("/", quotesController.create);
router.put("/:id", quotesController.update);
router.delete("/:id", quotesController.softDelete);

module.exports = router;
