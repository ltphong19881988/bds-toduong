var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
// var request = require('request');
// var cheerio = require('cheerio');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var xl = require('excel4node');
var router = express.Router();
// const fileManager = require('file-manager-js');
var User = require('../../models/user');
var Category = require('../../models/category');
var CategoryType = require('../../models/category-type');
var Project = require('../../models/project');
// var ProjectType = require('../../models/project-type');
var ProjectContent = require('../../models/project-content');
// var Role   = require('../models/role');
// var UserRole   = require('../models/userrole');
// var UserAuth   = require('../models/userauth');

var config = require('../../config'); // get our config file
// const { delete } = require('request');
// var Tool = require('../../helpers/tool');
var secretKey = config.secret;


router.post('/all-project', async function(req, res, next) {
    // console.log(req.body.aoData);
    var result = await Project.FilterDataTableProject(req.body.aoData);
    var records = {
        'draw': req.body.aoData[0].value,
        'recordsTotal': 2,
        'recordsFiltered': 0,
        'data': result
    };
    res.json(records);
})

router.post("/item", async(req, res, next) => {
    console.log(req.body);
    if (!req.body.project.projectContent.title) {
        return res.json({ status: false, mes: "Vui lòng nhập tiêu đề ( tên ) sản phẩm" })
    }

    var project = {
        nameKey: '',
        // idCategory: req.body.project.idCategory,
        // idCategoryType: req.body.project.idCategoryType,
        normalPrice: req.body.project.normalPrice,
        address: req.body.project.address,
        pictures: req.body.project.pictures,
        tags: req.body.project.tags,
        projectScale: req.body.project.projectScale,
        totalAcreage: req.body.project.totalAcreage,
        acreage: req.body.project.acreage,
        // alleyWidth: req.body.project.alleyWidth,
        direction: req.body.project.direction,
        province: req.body.project.province,
        district: req.body.project.district,
        ward: req.body.project.ward,
        hot: req.body.project.hot,
        visible: req.body.project.visible
    };
    var project_content = {
        title: req.body.project.projectContent.title,
        // oneLvlUrl: { type: String, unique: true },
        descriptions: req.body.project.projectContent.descriptions,
        content: req.body.project.projectContent.content,
        seoKeyWord: req.body.project.projectContent.seoKeyWord,
        seoDescriptions: req.body.project.projectContent.seoDescriptions,
    };

    var result = await Project.AddProject(project, project_content);
    res.json(result);

})

router.get("/item/:id", function(req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);
    let options = {
        _id: id,
    }
    Project.aggregate([{
            $match: options,
        },
        {
            $lookup: {
                from: "categories",
                localField: "idCategory",
                foreignField: "_id",
                as: "category"
            },
        },
        // { $unwind: "$category" },
        {
            $lookup: {
                from: "projectcontents",
                localField: "_id",
                foreignField: "idProject",
                as: "projectContent"
            },
        },
        { $unwind: "$projectContent" },
    ], function(err, result) {
        // console.log('get project', result);
        if (result.length > 0)
            res.json(result[0]);
        else res.json(null);
    })
})

router.put("/item", async(req, res, next) => {
    let project = req.body.project;
    let projectContent = project.projectContent;
    delete project.category;
    delete project.projectContent;
    var result = await Project.UpdateProject(project, projectContent);
    res.json(result);
})




router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

module.exports = router