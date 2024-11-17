import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const companySchema = new mongoose.Schema(
  {
    company_id: { type: Number},
    company_code: {
      type: Number
    },
    company_name: { type: String},
    company_logo: { type: String },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "system_user",
      default: null,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "system_user",
      default: null,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const CompanyModel = mongoose.model("managecompany", companySchema);
export default CompanyModel;
