import CompanyModel from "../models/company.model.js";
import Utils from "../utils/utils.js";
export default class CompanySerive {
  CreateNewCompany = async (_req, _res) => {
    console.log(_req.body);
    try {
      let company = await CompanyModel.exists({
        company_id: _req.body.company_id,
      });
      if (company) {
        _res.status(500).send("company Id Already existe");
        return;
      }
      company = await CompanyModel.exists({
        company_code: _req.body.company_code,
      });
      if (company) {
        _res.status(500).send("company Code Already existe");
        return;
      }
      if (!company) {
        company = await CompanyModel.create(_req.body);
        _res.send({ message: "Created Successfully" });
        return;
      }
    } catch (_e) {
      Utils.handleError({ message: _e }, _res);
    }
  };
  GetCompany = async (_req, _res) => {
    let { id } = _req.params;
    console.log(id)
    let company = await CompanyModel.findById(id);
    if (!company) {
      _res.status(500).send("Company Not Found");
      return;
    }
    _res.send(company);
  };
  GetCompanys = async (_req, _res) => {
    let { page = 0, limit = 10 } = _req.query;
    let company = await CompanyModel.find().limit(limit).skip(page);
    _res.send(company);
  };

  updateCompany = async (_req, _res) => {
    let id = _req.query.id;
    try {
      let company = await CompanyModel.exists({
        company_id: _req.body.company_id,
        _id: { $ne: id },
      });
      if (company) {
        _res.status(500).send("company Id Already existe");
        return;
      }
      company = await CompanyModel.exists({
        company_code: _req.body.company_code,
        _id: { $ne: id },
      });
      if (company) {
        _res.status(500).send("company Code Already existe");
        return;
      }
      company = await CompanyModel.findById(id);
      if (!company) {
        _res.status(500).send("company Not Found");
        return;
      }
      if (company) {
        company = await CompanyModel.findByIdAndUpdate({ _id: id }, _req.body, {
          new: true,
        });
        _res.send({ message: "Updated Successfully" });
        return;
      }
    } catch (_e) {
      Utils.handleError({ message: _e }, _res);
    }
  };
  deleteCompany = async (_req, _res) => {
    console.log(_req.body);
    let id = _req.query.id;
    try {
      let company = await CompanyModel.exists({
        company_id: _req.body.id,
      });
      if (!company) {
        _res.status(500).send("company Not Found");
        return;
      }
      await CompanyModel.deleteOne({ _id: id });
    } catch (_e) {
      Utils.handleError({ message: "sdzx" }, _res);
    }
  };
}
