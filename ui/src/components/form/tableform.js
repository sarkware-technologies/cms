import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";

const ApiTable = (props, ref) => {
  const [state, setState] = useState({
    testName: "",
    apis: [],
  });


  useEffect(() => {
    const request = {
      method: "GET",
      endpoint: "/system/v1/api_manager/api/all",
    };

    window._controller.docker.dock(request)
      .then((_res) => {
        const updatedApis = _res.map((element) => ({
          default: element.route,
          targetroute: element.route,
        }));
        setState((prev) => ({
          ...prev,
          apis: updatedApis,
        }));
        updatestate(updatedApis);
      })
      .catch((e) => {
        window._controller.notify(e.message, "error");
      });

  }, []);

  const updatestate = (apistate) => {
    if (props?.abdetails != null && props?.abdetails.testName != null) {
      setState((prev) => ({
        ...prev,
        testName: props?.abdetails.testName,
      }));
      apistate.map((apis) => {
        let apiss = props?.abdetails.apis;
        if (apiss) {
          if (apiss[apis.default] != apis.targetroute) {
            return apis.targetroute = apiss[apis.targetroute];
          }
        }
        return apis;
      })
      setState((prev) => ({
        ...prev,
        apis: apistate,
      }));
    }
  }
  const handleChange = (e, index) => {
    const { value } = e.target;
    setState((prev) => {
      const updatedApis = [...prev.apis];
      updatedApis[index].targetroute = value;
      return { ...prev, apis: updatedApis };
    });
  };

  const handleChange_title = (e) => {
    const { value } = e.target;
    setState((prev) => {
      const updatedApis = [...prev.apis];
      prev.testName = value;
      return { ...prev, apis: updatedApis };
    });
  };
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "16px",
  };

  const headerStyle = {
    color: "black",
    textAlign: "left",
    fontWeight: "bold",
  };

  const cellStyle = {
    padding: "12px 15px",
    border: "1px solid #ddd",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  const inputStyle_title = {
    width: "250px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
    marginLeft: "20px"
  };

  const hoverStyle = {
    backgroundColor: "#f1f1f1",
  };
  const changed = {
    color: "red",
  };

  useImperativeHandle(ref, () => ({
    setState: (newState) => setState((prev) => ({ ...prev, ...newState })),
    getState: () => state,
  }));


  return (
    <div style={{ width: "100%", position: 'absolute', margin: "20px auto", padding: "10px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px", fontWeight: 'bold', color: 'black' }}>API Target Route Configuration</h2>
      <br />
      <div>
        <label style={{ fontWeight: 'bold' }}><b>Test Name :</b></label>
        <input style={inputStyle_title} value={state.testName} onChange={(e) => handleChange_title(e)} />

      </div>
      <br />
      <br />
      <table style={tableStyle}>
        <thead>
          <tr style={headerStyle}>
            <th>S.no</th>
            <th>Default Route</th>
            <th>Target Route</th>
          </tr>
        </thead>
        <tbody>
          {state.apis.map((api, index) => (
            <tr key={index} style={{ ...hoverStyle }} >
              <td style={{ ...cellStyle, ...api.targetroute != api.default ? changed : {} }}>{index + 1}</td>
              <td style={{ ...cellStyle, ...api.targetroute != api.default ? changed : {} }}>{api.default}</td>
              <td style={{ ...cellStyle, ...api.targetroute != api.default ? changed : {} }}>
                <input
                  style={{ ...inputStyle, ...api.targetroute != api.default ? changed : {} }}
                  type="text"
                  value={api.targetroute}
                  onChange={(e) => handleChange(e, index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default forwardRef(ApiTable);
