const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a project title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
        type: String,
        index: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Live'],
        default: 'Draft'
    },
    content: {
        type: Object, // This stores the structured JSON data (personal info, skills, etc.)
        default: {}
    },
    generatedCode: {
        html: { type: String, default: '' },
        css: { type: String, default: '' },
        js: { type: String, default: '' }
    },
    blueprint: {
        type: Object, // Stores the PortfolioBlueprint JSON from the Template Intelligence Layer
        default: {}
    },
    thumbnail: {
        type: String,
        default: ''
    },
    /**
     * generationPhase — tracks which pipeline stage is currently running.
     * The client polls GET /api/projects/:id/phase every 1.5s during generation
     * to drive the cinematic preview loading UI.
     *
     * Lifecycle:
     *   null → 'blueprint' → 'html' → 'css' → 'js' → 'assembling' → 'done'
     *   On error: 'error'
     */
    generationPhase: {
        type: String,
        enum: [null, 'blueprint', 'html', 'css', 'js', 'assembling', 'done', 'error'],
        default: null
    },
    views: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

// Create project slug from title before saving
ProjectSchema.pre('save', async function() {
    if (!this.isModified('title')) {
        return;
    }
    this.slug = this.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
});

module.exports = mongoose.model('Project', ProjectSchema);
