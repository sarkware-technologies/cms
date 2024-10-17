import EntityModel from "../models/entity.js";
import FieldModel from "../models/field.js";
import Utils from "../utils/utils.js";

export default class FieldService {

    constructor() {}

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Field id is missing");
        }

        try {

            return await FieldModel.findOne({ _id: _req.params.id }).lean();            

        } catch (_e) {
            throw _e;
        }

    };

    list = async (_req) => {

        let _fields = [];
        
        const page = parseInt(_req.query.page) || 1;
        const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
        const limit = parseInt(process.env.PAGE_SIZE);
        const populate = _req.query.populate ? _req.query.populate : false;

        const searchFor = _req.query.search ? _req.query.search : "";
        const searchFrom = _req.query.field ? _req.query.field : "";

        const filter = _req.query.filter ? _req.query.filter : "";
        const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
        const filterType = _req.query.filter_type ? _req.query.filter_type : "";

        if (searchFrom !== "") {
            return this.search(_req, page, skip, limit, searchFrom, searchFor);
        }

        if (filter !== "") {
            if (filterType === "seeds") {
                return this.groupSeed(_req, filter);
            } else {
                return this.groupBy(_req, page, skip, limit, filter, filterBy);
            }
        }

        try {
            
            const _count = await FieldModel.countDocuments({});

            if (populate) {                
                _fields = await FieldModel.find({}).populate('entity').sort({ title: 1 }).skip(skip).limit(limit).lean().exec();                
            } else {
                _fields = await FieldModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            }
            
            return Utils.response(_count, page, _fields);

        } catch (_e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {            
            const _count = await FieldModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _fields = await FieldModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).populate('entity').skip(_skip).limit(_limit).lean().exec();
            return Utils.response(_count, _page, _fields);
        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            if (_field === "entity") {
                const seeds = [];
                const eIds = await FieldModel.distinct(_field).exec();
                for (let i = 0; i < eIds.length; i++) {
                    seeds.push(await EntityModel.findById(eIds[i]).lean());
                }
                return seeds; 
            } 
            return await FieldModel.distinct(_field).exec();
        } catch (_e) { 

            throw _e;
        }

    };

    groupBy = async(_req, _page, _skip, _limit, _field, _match) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            const _count = await FieldModel.countDocuments(query);
            const _roles = await FieldModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await FieldModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    create = async (_req) => {

        try {

            const model = new FieldModel(_req.body);
            return await model.save();                            

        } catch (_e) {            
            throw _e;
        }

    };

    // to get role data based on role name
    handle = async (_req) => {

        const handle = _req.params.handle

        try {

            const field = await FieldModel.findOne({handle: handle})
            
            if(!field){
                throw new Error("No Field with the given handle")
            }

            return field;

        } catch (_e) {
            throw _e;
        }

    };


    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Field id is missing");
        }

        try {
            return await FieldModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Field id is missing");
        }

        try {            
            return await FieldModel.deleteOne({ _id: _req.params.id });
        } catch (_e) {
            throw _e;
        }

    };

}