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
        type: Object, // This will store the generated portfolio structure
        default: {}
    },
    thumbnail: {
        type: String,
        default: ''
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
