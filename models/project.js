// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
const Tool = require('./helpers/tool');
const ProjectContent = require('./project-content');
const Category = require('./category');
const Post = require('./post');
const PostContent = require('./post-content');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var Project = new Schema({
    nameKey: { type: String, unique: true, required: true }, // pr97590432 .....
    idCategory: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    idCategoryType: { type: Schema.Types.ObjectId, ref: 'CategoryType' },
    videoUrl: String,
    videoTitle: String,
    datecreate: { type: Date, default: Date.now },
    normalPrice: Number, // GIÁ THẤP NHẤT
    address: String, // địa chỉ
    pictures: [],
    tags: [],
    acreage: Number, // diện tích xây dựng
    totalAcreage: Number, // Tổng diện tích
    projectScale: String, // Qui mô dự án
    // alleyWidth: Number,
    direction: {},
    province: {},
    district: {},
    ward: {},
    visible: { type: Number, default: 1 }, // 1 is visible
    hot: { type: Boolean, default: true }
});
var Project = mongoose.model('Project', Project);
module.exports = Project;

var createProject = async function(item, opts) {
    return new Promise((resolve, reject) => {
        item = new Project(item);
        resolve(item.save(opts));
    });
}

var createProjectContent = async function(item, opts) {
    return new Promise((resolve, reject) => {
        item = new ProjectContent(item);
        resolve(item.save(opts));
    });
}

var anAsyncMapFunction = async function(item) {
    return functionWithPromise(item)
}

var filterCategoryFromName = async function(name) {
    return PostContent.aggregate([
            { $match: { title: { $regex: name, $options: 'iu' } } },
            {
                $lookup: {
                    from: "posts",
                    localField: "idPost",
                    foreignField: "_id",
                    as: "post"
                },
            },
            { $unwind: "$post" },
            {
                $match: { 'post.postType': 0 }
            }
        ]).exec()
        .then(result => {
            return new Promise(resolve => {
                Promise.all(result.map(async function(item) {
                    return item.post.idCategory;
                })).then(abc => {
                    resolve(abc);
                });
            });
        })
        .catch(err => {
            console.log('err', err);
        });

}

module.exports.AddProject = async function(project, project_content) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        project_content['oneLvlUrl'] = Tool.change_alias(project_content.title);
        const opts = { session, new: true };
        var lastNameKey = await Project.findOne({}).sort({ 'datecreate': -1 }).exec();
        // console.log(lastNameKey);
        if (lastNameKey == null) project['nameKey'] = 'pj1000000';
        else {
            var abc = parseInt(lastNameKey.nameKey.replace('pj', '')) + 1;
            project['nameKey'] = 'pj' + abc.toString();
        }
        var savedDoc = await createProject(project, opts);
        project_content['idProject'] = savedDoc._id;
        var saveContent = await createProjectContent(project_content, opts);
        console.log(savedDoc, saveContent);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Tạo dự án thành công' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }


    // Tweet.findOne({}, {}, { sort: { 'created_at': 1 } }, function(err, post) {
    //     cb(null, post.created_at.getTime());
    // });
}

module.exports.UpdateProject = async function(project, project_content) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        project_content['oneLvlUrl'] = Tool.change_alias(project_content.title);
        const opts = { session, new: true };
        await Project.findOneAndUpdate({ _id: project._id }, project, opts);
        await ProjectContent.findOneAndUpdate({ _id: project_content._id }, project_content, opts);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Update sản phẩm thành công' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }


    // Tweet.findOne({}, {}, { sort: { 'created_at': 1 } }, function(err, post) {
    //     cb(null, post.created_at.getTime());
    // });
}

module.exports.FilterDataTableProject = async function(data) {
    console.log(data);
    let options = {}
        // if (req.body.idCategoryType) {
        //     options.idCategoryType = mongoose.Types.ObjectId(req.body.idCategoryType);
        // }
    var hot = data[1].value.filter(item => item.data == 'projectType')[0];
    if (hot && hot.search.value) {
        options['projectType'] = { $elemMatch: { value: hot.search.value } };
    }
    var province = data[1].value.filter(item => item.data == 'province.title')[0];
    if (province && province.search.value) {
        options['province.title'] = { $regex: province.search.value, $options: 'ui' };
    }
    var district = data[1].value.filter(item => item.data == 'district.title')[0];
    if (district && district.search.value) {
        options['district.title'] = { $regex: district.search.value, $options: 'ui' };
    }
    var categoryName = data[1].value.filter(item => item.data == 'categoryName')[0];
    if (categoryName && categoryName.search.value) {
        var listCate = await filterCategoryFromName(categoryName.search.value);
        console.log('listCate', listCate);
        options['idCategory'] = { $in: listCate };
    }


    return Project.aggregate([{
            $match: options,
        },
        {
            $sort: { datecreate: -1 }
        },
        // {
        //     $lookup: {
        //         from: "categories",
        //         localField: "idCategory",
        //         foreignField: "_id",
        //         as: "category"
        //     },
        // },
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
        {
            $project: {
                "hot": 1,
                "nameKey": 1,
                "normalPrice": 1,
                "pictures": 1,
                "salePrice": 1,
                "datecreate": 1,
                "title": '$projectContent.title',
                "province": 1,
                "district": 1,
                "ward": 1,
                visible: 1,
            }
        },
    ], function(err, result) {
        // console.log('project', err, result);
        if (err) result = [];
        return (result);
    })

}