/*
CREATED BY

NAME: BISWARUP BHATTACHARJEE
PH NO.: 6290272740
EMAIL: bbiswa471@gmail.com
*/
const { Product } = require('../fg-models/product');
const express = require('express');
const { Category } = require('../fg-models/category');
var admin = require("firebase-admin");
const UUID = require('uuid-v4');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
var serviceAccount = require("../fg-serviceAccount/fg-images-bucket-firebase-adminsdk-46hff-80fbb0b83b.json");
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'fg-public/fg-uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });
//--------------FIREBASE CONNECTION INITIALIZED--------------//
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "fg-images-bucket.appspot.com"
});
var bucket = admin.storage().bucket();
var pok='';
function setUrl(str){
    pok=str;
}

async function uploadFile(filepath,filename) {
    let uuid = UUID();
  const metadata = {
    metadata: {
      // This line is very important. It's to create a download token.
      firebaseStorageDownloadTokens: uuid
    },
  };
  await bucket.upload(filepath, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    metadata: metadata,
  }).then((data)=>{
    setUrl("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" +filename+ "?alt=media&token=" + uuid);
    
   });
 

}



var pokitem='';
var listurls=[];
function setUrll(str){
    pokitem=str;
    listurls.push(pokitem);
}
async function uploadFiles(filepaths,filenames) {
    let uuid = UUID();
  const metadata = {
    metadata: {
      // This line is very important. It's to create a download token.
      firebaseStorageDownloadTokens: uuid
    },
  };
  for(let i = 0; i < filepaths.length; i++){
    await bucket.upload(filepaths[i], {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        metadata: metadata,
      });
    setUrll("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" +filenames[i]+ "?alt=media&token=" + uuid);
  }
  console.log(listurls);
}




//-----------------------------------------------------------//
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    uploadFile(`fg-public/fg-uploads/${fileName}`,`${fileName}`).then(async function() {
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${pok}`, // "http://localhost:3000/public/upload/image-2323232"
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        });
    
        product = await product.save();
    
        if (!product) return res.status(500).send('The product cannot be created');
    
        res.send(product);
    })
    

});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `fg-public/fg-uploads/`;
        imagepath = `${basePath}${fileName}`;
        uploadFile(`${imagepath}`,`${fileName}`).then(async function() {
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name: req.body.name,
                    description: req.body.description,
                    richDescription: req.body.richDescription,
                    image: `${pok}`,
                    brand: req.body.brand,
                    price: req.body.price,
                    category: req.body.category,
                    countInStock: req.body.countInStock,
                    rating: req.body.rating,
                    numReviews: req.body.numReviews,
                    isFeatured: req.body.isFeatured,
                },
                { new: true }
            );
        
            if (!updatedProduct)
                return res.status(500).send('the product cannot be updated!');
        
            res.send(updatedProduct);
        })
    } else {
        imagepath = product.image;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: `${imagepath}`,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            },
            { new: true }
        );
    
        if (!updatedProduct)
            return res.status(500).send('the product cannot be updated!');
    
        res.send(updatedProduct);
    }

   
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message: 'the product is deleted!',
                    });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'product not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount,
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        const imagePaths = [];
        const images = [];
        if (files) {
            files.map((file) => {
                imagePaths.push(`fg-public/fg-uploads/${file.filename}`)
                images.push(`${file.filename}`)
            })
        }
        uploadFiles(imagePaths,images).then(async function(){
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    images: listurls,
                },
                { new: true }
            );
    
            if (!product)
                return res.status(500).send('the gallery cannot be updated!');
    
            res.send(product);
            listurls=[];
        })
        
 
    }
);

module.exports = router;
