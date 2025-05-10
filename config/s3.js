const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const uploadToS3 = async (file) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const result = await s3.upload(params).promise();
        return result.Location; // URL da imagem
    } catch (error) {
        console.error('Erro ao fazer upload para S3:', error);
        throw error;
    }
};

const deleteFromS3 = async (imageUrl) => {
    const key = imageUrl.split('/').pop();
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('Erro ao deletar do S3:', error);
        throw error;
    }
};

module.exports = { uploadToS3, deleteFromS3 }; 