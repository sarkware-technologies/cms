import { v4 as uuidv4 } from 'uuid';
import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from "react";
import Input from "../components/form/input";
import Select from "../components/form/select";
import RadioButton from "../components/form/radiobutton";
import CheckBox from "../components/form/checkbox";
import TextArea from "../components/form/textarea";
import Toggle from "../components/form/toggle";
import Search from "../components/search";
import Text from "../components/form/text";
import Alignment from '../components/alignment';
import Media from '../components/media';
import MultiSelect from '../components/multi-select';

class Helper {

	static setFieldValues = (_namespace, _rows, _payload) => { 

		if (!_rows) {
			return null;
		}

		let dateVal = "";
		let _fields = [];
		const inputFields = ["text","textarea","select","password","number","date","email","time","week","month","datetime-local","color","file"];

		for (let i = 0; i < _rows.length; i++) {
			if (_rows[i].columns) {
				for (let j = 0; j < _rows[i].columns.length; j++) {
					if (_rows[i].columns[j].type === "fields") {    
						
						_fields = _rows[i].columns[j].fields;
						for (let k = 0; k < _fields.length; k++) {

							if (!_payload[_fields[k].handle]) {
								continue;
							}

							if (inputFields.indexOf(_fields[k].type) !== -1) { 
								if (_fields[k].type === "date" || _fields[k].type === "datetime-local") { 
									dateVal = "";
									if (_payload[_fields[k].handle]) {
										dateVal = new Date(_payload[_fields[k].handle]);
									} 
									window._controller.setInputFieldVal(_namespace + _fields[k].handle, dateVal);
								} else {
									window._controller.setInputFieldVal(_namespace + _fields[k].handle, _payload[_fields[k].handle]);
								}								
							} else if (_fields[k].type === "search") {
								window._controller.setSearchRecord(_namespace + _fields[k].handle, _payload[_fields[k].handle]);
							} else if (_fields[k].type === "toggle") {
								window._controller.setToggleStatus(_namespace + _fields[k].handle, _payload[_fields[k].handle]);
							} else if (_fields[k].type === "checkbox" || _fields[k].type === "radio") {
								//window._controller.loadFieldChoices(_fields[k].handle, _payload[_fields[k].handle]);
							} else if (_fields[k].type === "label") {
								window._controller.setInputFieldVal(_namespace + _fields[k].handle, _payload[_fields[k].handle]);
							} else {
								/* Ignore */
							}

						}

					}
				}
			}
		}

	};

	static getFieldValues = (_namespace, _rows) => {

		if (!_rows) {
			return {};
		}

		let value = "",  
			_fields = [],               
			fieldRef = null,
			fieldFlaq = true,
			globalFlaq = true;

		const payload = {};
		const inputFields = ["text","textarea","select","password","number","date","email","time","week","month","datetime-local","color","file"];
		
		for (let i = 0; i < _rows.length; i++) {
			if (_rows[i].columns) {
				for (let j = 0; j < _rows[i].columns.length; j++) {
					if (_rows[i].columns[j].type === "fields") {    
						
						_fields = _rows[i].columns[j].fields;
						for (let k = 0; k < _fields.length; k++) {
			
							fieldFlaq = true;
							fieldRef = window._controller.getField(_namespace + _fields[k].handle);
							if (!fieldRef) {
								continue;
							}
				
							if (inputFields.indexOf(_fields[k].type) !== -1) {
				
								value = window._controller.getInputFieldVal(_namespace + _fields[k].handle);									

								if (_fields[k].mandatory) {
									/* Mandatory Block */
									if (_fields[k].pattern) {                            
										/* Use regular expression */
										if (!value.match(_fields[k].pattern)) {
											fieldRef.setError();
										}
									} else {
										/* No pattern exist, so normal check */
										if (_fields[k].type === "number") {
				
											if (isNaN(value)) {                                    
												fieldFlaq = false;                                    
											}
											if (_fields[k].min && (parseFloat(_fields[k].min) <= parseFloat(value))) {
												fieldFlaq = false;
											}
											if (_fields[k].max && (parseFloat(_fields[k].max) >= parseFloat(value))) {
												fieldFlaq = false;
											}
				
											if (!fieldFlaq) {
												globalFlaq = false;
												fieldRef.setError();
											}
				
										} else {
				
											if (!value) {
												fieldFlaq = false;     
												globalFlaq = false;
												fieldRef.setError();
											}
										}
				
									}
								}
				
								if (fieldFlaq && value) {                        
									payload[_fields[k].handle] = value;
								}
				
							} else if (_fields[k].type === "search") {
				 
								/* Validation for Search */
								value = window._controller.getCurrentRecord(_namespace + _fields[k].handle);
								if (_fields[k].mandatory && !value) {
									fieldFlaq = false;     
									globalFlaq = false;
									fieldRef.setError();
								} else {
									if (value) {
										payload[_fields[k].handle] = value;
									}									
								}
				
							} else if (_fields[k].type === "toggle") {
								/* No validation needed for toggle */
								payload[_fields[k].handle] = window._controller.getToggleStatus(_namespace + _fields[k].handle);
							} else if (_fields[k].type === "multiselect") {
								payload[_fields[k].handle] = fieldRef.getSelectedRecords();
							}

						}
					}
				}
			}                        
		}	

		return globalFlaq ? payload : {};

	};

	static resetForm = (_namespace, _rows) => {

		if (!_rows) {
			return null;
		}

		let _fields = [], fieldRef;
		const inputFields = ["text","textarea","select","password","number","date","email","time","week","month","datetime-local","color","file"];

		for (let i = 0; i < _rows.length; i++) {
			if (_rows[i].columns) {
				for (let j = 0; j < _rows[i].columns.length; j++) {
					if (_rows[i].columns[j].type === "fields") {    
						
						_fields = _rows[i].columns[j].fields;
						for (let k = 0; k < _fields.length; k++) {

							fieldRef = window._controller.getField(_namespace + _fields[k].handle);
							if (!fieldRef) {
								continue;
							}

							if (inputFields.indexOf(_fields[k].type) !== -1) {
								window._controller.setInputFieldVal(_namespace + _fields[k].handle, "");
							} else if (_fields[k].type === "search") {
								window._controller.setSearchRecord(_namespace + _fields[k].handle, null);
							} else if (_fields[k].type === "toggle") {
								window._controller.setToggleStatus(_namespace + _fields[k].handle, false);
							} else if (_fields[k].type === "checkbox") {
								fieldRef.clearChoices();								
							} else if (_fields[k].type === "radio") {

							} else {
								/* Ignore */
							}

						}

					}
				}
			}
		}

	};

	static buildWrapper = (_config, _field) => {

        return (
            <div key={uuidv4()} className={`fields-factory-form-field-wrapper ${_config.classes}`}>
                <div className={`fields-factory-form-field-wrap ${_config.label_position}`}>
                    <div>
						<label className={`fields-factory-form-field-label ${ _config.mandatory ? "required" : "" }`} dangerouslySetInnerHTML={{ __html: _config.label }}></label>
                    </div>
                    <div>
						{_field}
						<p className="fields-factory-form-error-message">{_config.validation_message}</p>
                    </div>
                </div>
            </div>
        );

    };

    static getLocaleResource = (_rObj) => {

        let res = {};         
        if( typeof _rObj === 'object' ) {
			if (typeof _rObj.rkey !== 'undefined' && _rObj.rkey !== "") { 

                res["rkey"] = _rObj.rkey;
                let locale = window._controller.getCurrentLocale();               

                if (locale === "dflt" || locale === "en" || locale === "") {
					res["value"] = _rObj.dflt;
				} else {
                    let rBundle = window._controller.getCurrentModuleInstance().getConfig();
					if (rBundle && rBundle["resources"]) {
						res["value"] = rBundle["resources"][_rObj.rkey][locale];
					} else {
						res["value"] = _rObj.dflt;
					}					
				}

            } else {
				res["rkey"] = 'dflt';
				res["value"] = _rObj.dflt;
			}
        } else {
			res["rkey"] = "";
			res["value"] = _rObj;
		}

        return res;

    };

	/**
	 * 
	 * @param {*} _config 
	 * @param {*} _data 
	 * @param {*} _namespace 
	 * @returns 
	 * 
	 * Used by the component editors
	 * 
	 */
	static renderConfigFields = (_namespace, _config, _data) => {

		const fieldList = [];
		const fieldRefList = {};				

		let configKeys = Object.keys(_config);

		for (let i = 0; i < configKeys.length; i++) {

			let field = null;               	
			let fieldRef = React.createRef();

			if ([configKeys[i]] in _data) {
				_config[configKeys[i]]["value"] = _data[configKeys[i]];
			}

			if ("visible" in _config[configKeys[i]]) {
				if (!_config[configKeys[i]].visible) {
					continue;
				}
			}

			if (_config[configKeys[i]].type === "text" 
				|| _config[configKeys[i]].type === "password" 
				|| _config[configKeys[i]].type === "number" 
				|| _config[configKeys[i]].type === "date" 
				|| _config[configKeys[i]].type === "email" 
				|| _config[configKeys[i]].type === "time" 
				|| _config[configKeys[i]].type === "week" 
				|| _config[configKeys[i]].type === "datetime-local" 
				|| _config[configKeys[i]].type === "color" 
				|| _config[configKeys[i]].type === "month") 
			{				
				field = <Input onChange={(_e) => window._controller.getCurrentModuleInstance().onFieldChange((_namespace + _config.handle), _e.target.value, _e)} ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "select") 
			{
				field = <Select onChange={(_e) => window._controller.getCurrentModuleInstance().onFieldChange((_namespace + _config.handle), _e.target.value, _e)} ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			} 
			else if (_config[configKeys[i]].type === "check") 
			{  
				field = <CheckBox ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "radio") 
			{
				field = <RadioButton ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "textarea") 
			{
				field = <TextArea ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "toggle") 
			{ 
				field = <Toggle ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "search") 
			{
				field = <Search ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "label") 
			{
				field = <Text ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			} 
			else if (_config[configKeys[i]].type === "alignment") 
			{
				field = <Alignment ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}
			else if (_config[configKeys[i]].type === "media") 
			{
				field = <Media ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} value={_config[configKeys[i]]["value"] ? _config[configKeys[i]]["value"] : ""} />
			}
			else if (_config[configKeys[i]].type === "multiselect") 
			{
				field = <MultiSelect ref={fieldRef} namespace={_namespace} config={_config[configKeys[i]]} />
			}

			if (field) {
				fieldList.push(Helper.buildWrapper(_config[configKeys[i]], field));
				fieldRefList[_namespace + _config[configKeys[i]].handle] = fieldRef;
			}			

		}

		return {
			fields: fieldList,
			refs: fieldRefList
		};

	};
	
	/**
	 * 
	 * @param {*} _namespace 
	 * @param {*} _config 
	 * @param {*} _fields 
	 * @returns 
	 * 
	 * Used by the component editor
	 * 
	 */
	static getConfigFieldValues = (_namespace, _config, _fields) => {

		let value = "",
			fieldKey = "",
			fieldFlaq = true,
			globalFlaq = true;

		const payload = {};
		const cKeys = Object.keys(_config);
		const inputFields = ["text","textarea","select","password","number","date","email","time","week","month","datetime-local","color","file"];

		for (let i = 0; i < cKeys.length; i++) {

			fieldFlaq = true;			
			fieldKey = (_namespace + cKeys[i]);

			if (_fields[fieldKey] && _fields[fieldKey].current) {
				
				if (inputFields.indexOf(_config[cKeys[i]].type) !== -1) {
				
					value = _fields[fieldKey].current.getVal();
					
					if (_config[cKeys[i]].type === "color" && !value) {
						value = "#000000";
					}					

					if (_config[cKeys[i]].mandatory) {

						/* Mandatory Block */
						if (_config[cKeys[i]].pattern) {                            
							/* Use regular expression */
							if (!value.match(_config[cKeys[i]].pattern)) {
	
							}
						} else {
							/* No pattern exist, so normal check */
							if (_config[cKeys[i]].type === "number") {
	
								if (isNaN(value)) {                                    
									fieldFlaq = false;                                    
								}

								if (!isNaN(_config[cKeys[i]].min)) {
									if (parseFloat(value) < parseFloat(_config[cKeys[i]].min)) {
										return null;
									}
								}
		
								if (!isNaN(_config[cKeys[i]].max)) {
									if (parseFloat(value) > parseFloat(_config[cKeys[i]].max)) {
										return null;
									}
								}								
	
								if (!fieldFlaq) {
									globalFlaq = false;
									_fields[fieldKey].current.setError();
								}
	
							} else {
	
								if (!value) {
									fieldFlaq = false;     
									globalFlaq = false;
									_fields[fieldKey].current.setError();
								}
							}
	
						}

					}

					/* Min max check */
					if (_config[cKeys[i]].type === "number" && !value) {
						globalFlaq = false;
						_fields[fieldKey].current.setError();
					}
	
					if (fieldFlaq && value) {                        
						payload[_config[cKeys[i]].handle] = value;
					}
	
				} else if (_config[cKeys[i]].type === "alignment") {

					payload[_config[cKeys[i]].handle] = _fields[fieldKey].current.getVal();	

				} else if (_config[cKeys[i]].type === "media") {

					payload[_config[cKeys[i]].handle] = _fields[fieldKey].current.getVal();	
					payload[_config[cKeys[i]].handle +"_dimension"] = _fields[fieldKey].current.getDimension();

				} else if (_config[cKeys[i]].type === "search") {
	
					/* Validation for Search */					
					value = _fields[fieldKey].current.getCurrentRecord();

					if (_config[cKeys[i]].mandatory && !value) {
						fieldFlaq = false;     
						globalFlaq = false;
						_fields[fieldKey].current.setError();
					} else {
						if (value) {
							payload[_config[cKeys[i]].handle] = value;
						}									
					}
	
				} else if (_config[cKeys[i]].type === "toggle") {
					/* No validation needed for toggle */
					payload[_config[cKeys[i]].handle] = _fields[fieldKey].current.getStatus();					
				}

			}

		}

		return globalFlaq ? payload : null;

	};

}

export default Helper;