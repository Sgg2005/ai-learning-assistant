import FlashCard from '../models/FlashCard.js'

//@desc    Create a flashcard
//@route   POST /api/flashcards
//@access  Private
export const getFlashcards = async (req, res, next) => {
    try{
        const flashcards = await FlashCard.find({
            userId: req.user._id,
            documentId: req.query.documentId
        })
          .populate('documentId', 'title')
          .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    }catch (error) {
        next(error);
    }
};

// @desc    Get all flashcard sets for a document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await FlashCard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets
        });
    } catch (error) {
        next(error);
    }
};  

// @desc    Review a flashcard (update review stats)
// @route   POST /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await FlashCard.findOne({ 
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if(cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found in the set',
                statusCode: 404
            });
        }

        //updates reviews info
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard review updated'
        });
    } catch (error) {
        next(error);
    }
};

//@desc   Toggle star status of a flashcard
//@route  PUT /api/flashcards/:cardId/star
//@access Private
export const toggleStarFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await FlashCard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json ({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);  

        if(cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard not found in the set',
                statusCode: 404
            });
        }

        //toggle star status
        flashcardSet.cards [cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`
        });
    }catch (error) {
        next(error);
    }
};

// @desc    Delete a flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcardSet = async (req, res, next) => {
    try{
        const flashcardSet = await FlashCard.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });
    }catch (error) {
        next(error);
    }
};