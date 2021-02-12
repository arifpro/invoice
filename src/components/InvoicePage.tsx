import React, { FC, useState, useEffect } from "react";
import { Invoice, ProductLine } from "../data/types";
import {
  initialInvoice,
  initialProductLine,
  dhakaZipCodes,
} from "../data/initialData";
import EditableInput from "./EditableInput";
// import EditableSelect from "./EditableSelect";
import EditableTextarea from "./EditableTextarea";
import EditableCalendarInput from "./EditableCalendarInput";
// import countryList from "../data/countryList";
import Document from "./Document";
import Page from "./Page";
import View from "./View";
import Text from "./Text";
import { Font } from "@react-pdf/renderer";
// import Download from "./DownloadPDF";
import format from "date-fns/format";
import logo from "../images/logo.png";

Font.register({
  family: "Nunito",
  fonts: [
    { src: "https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf" },
    {
      src:
        "https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf",
      fontWeight: 600,
    },
  ],
});

interface Props {
  data?: Invoice;
  pdfMode?: boolean;
}

const InvoicePage: FC<Props> = ({ data, pdfMode }) => {
  const [invoice, setInvoice] = useState<Invoice>(
    data ? { ...data } : { ...initialInvoice }
  );
  const [subTotal, setSubTotal] = useState<number>();
  const [saleTax, setSaleTax] = useState<number>();
  const [deliveryCharge, setDeliveryCharge] = useState<string>();
  const [paidTotal, setPaidTotal] = useState<string>();
  // const [isDhaka, setIsDhaka] = useState<boolean>(false);

  let notes: string[];
  notes = [
    "Delivery charge 70 taka inside Dhaka, 100 taka outside Dhaka.",
    "Without cash on delivery place you have to pay advance through bKash/Rocket.",
    "If you return with an unnecessary reason we will ban you for future shopping from us",
    "You will get 15 days replacement warranty for gadget item.",
  ];

  let indexOfNote;

  // console.log(indexOfNote, saleTax);

  useEffect(() => {
    const zipStr = invoice.clientAddress2
      .toLowerCase()
      .split("")
      .filter((a) => isNaN(parseInt(a)) === false)
      .join("");

    if (
      invoice.clientAddress2.toLowerCase().indexOf("dhaka") !== -1 ||
      invoice.clientAddress.toLowerCase().indexOf("dhaka") !== -1 ||
      dhakaZipCodes?.find((zip) => zipStr.indexOf(zip.toString()) !== -1) !==
        undefined
    ) {
      // setIsDhaka(true);
      setDeliveryCharge("70.00");
      // console.log("Inside Dhaka");
    } else {
      // setIsDhaka(false);
      setDeliveryCharge("100.00");
      // console.log("Outside Dhaka");
    }
  }, [invoice.clientAddress2, invoice.clientAddress]);

  const dateFormat = "MMM dd, yyyy";
  const invoiceDate =
    invoice.invoiceDate !== "" ? new Date(invoice.invoiceDate) : new Date();
  const invoiceDueDate =
    invoice.invoiceDueDate !== ""
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf());

  if (invoice.invoiceDueDate === "") {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30);
  }

  const handleChange = (name: keyof Invoice, value: string) => {
    if (name !== "productLines") {
      const newInvoice = { ...invoice };
      newInvoice[name] = value;

      setInvoice(newInvoice);
    }
  };

  const handleProductLineChange = (
    index: number,
    name: keyof ProductLine,
    value: string
  ) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine };

        if (name === "description") {
          newProductLine[name] = value;
        } else {
          if (
            value[value.length - 1] === "." ||
            (value[value.length - 1] === "0" && value.includes("."))
          ) {
            newProductLine[name] = value;
          } else {
            const n = parseFloat(value);

            newProductLine[name] = (n ? n : 0).toString();
          }
        }

        return newProductLine;
      }

      return { ...productLine };
    });

    setInvoice({ ...invoice, productLines });
  };

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter(
      (productLine, index) => index !== i
    );

    setInvoice({ ...invoice, productLines });
  };

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }];

    setInvoice({ ...invoice, productLines });
  };

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity);
    const rateNumber = parseFloat(rate);
    const amount =
      quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

    return amount.toFixed(2);
  };

  useEffect(() => {
    let subTotal = 0;

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity);
      const rateNumber = parseFloat(productLine.rate);
      const amount =
        quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

      subTotal += amount;
    });

    setSubTotal(subTotal);
  }, [invoice.productLines]);

  useEffect(() => {
    const match = invoice.taxLabel.match(/(\d+)%/);
    const taxRate = match ? parseFloat(match[1]) : 0;
    const saleTax = subTotal ? (subTotal * taxRate) / 100 : 0;

    setSaleTax(saleTax);
    setPaidTotal("0.00");
    // setDeliveryCharge("0.00");
  }, [subTotal, invoice.taxLabel]);

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {/* {!pdfMode && <Download data={invoice} />} */}

        {/* header start */}
        <View className="flex" pdfMode={pdfMode}>
          <View pdfMode={pdfMode}>
            <div
              style={{
                // marginRight: "2rem",
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
              // pdfMode={pdfMode}
            >
              <img
                src={logo}
                alt="logo"
                width="100px"
                // pdfMode={pdfMode}
              />
            </div>
          </View>
          <View pdfMode={pdfMode}>
            <EditableInput
              className="fs-40 bold center space-remove"
              placeholder="Your Company"
              value={invoice.companyName}
              onChange={(value) => handleChange("companyName", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              className=" center space-remove"
              placeholder="Company Subtitle"
              value={invoice.companySubtitle}
              onChange={(value) => handleChange("companySubtitle", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              className="fs-15 bold center space-remove"
              placeholder="Company Contact"
              value={invoice.companyContact}
              onChange={(value) => handleChange("companyContact", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              className="fs-15 bold center space-remove"
              placeholder="Company Address"
              value={invoice.companyAddress}
              onChange={(value) => handleChange("companyAddress", value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>
        {/* header end */}

        {/* date pick start */}
        {/* <View className="flex end mt-10" pdfMode={pdfMode}>
          <View className="flex  mb-5" pdfMode={pdfMode}>
            <View className="w-40" pdfMode={pdfMode}></View>
            <View className="w-18" pdfMode={pdfMode}>
              <EditableInput
                className="bold"
                value={invoice.invoiceDateLabel}
                onChange={(value) => handleChange("invoiceDateLabel", value)}
                pdfMode={pdfMode}
              />
            </View>
            <View className="w-40" pdfMode={pdfMode}>
              <EditableCalendarInput
                value={format(invoiceDate, dateFormat)}
                selected={invoiceDate}
                onChange={(date) =>
                  handleChange(
                    "invoiceDate",
                    date && !Array.isArray(date) ? format(date, dateFormat) : ""
                  )
                }
                pdfMode={pdfMode}
              />
            </View>
          </View>
        </View> */}
        {/* date pick end */}

        {/* <View className="flex" pdfMode={pdfMode}>
          <View className="w-50" pdfMode={pdfMode}>
            <EditableInput
              className="fs-20 bold"
              placeholder="Your Company"
              value={invoice.companyName}
              onChange={(value) => handleChange("companyName", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Your Name"
              value={invoice.name}
              onChange={(value) => handleChange("name", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Company's Address"
              value={invoice.companyAddress}
              onChange={(value) => handleChange("companyAddress", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="City, State Zip"
              value={invoice.companyAddress2}
              onChange={(value) => handleChange("companyAddress2", value)}
              pdfMode={pdfMode}
            />
            <EditableSelect
              options={countryList}
              value={invoice.companyCountry}
              onChange={(value) => handleChange("companyCountry", value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-50" pdfMode={pdfMode}>
            <EditableInput
              className="fs-45 right bold"
              placeholder="Invoice"
              value={invoice.title}
              onChange={(value) => handleChange("title", value)}
              pdfMode={pdfMode}
            />
          </View>
        </View> */}

        {/* client start */}
        <View className="flex mt-40" pdfMode={pdfMode}>
          <View className="w-55" pdfMode={pdfMode}>
            <EditableInput
              className="bold dark mb-5"
              value={invoice.billTo}
              onChange={(value) => handleChange("billTo", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Client's Name"
              value={invoice.clientName}
              onChange={(value) => handleChange("clientName", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Client's Contact"
              value={invoice.clientPhone}
              onChange={(value) => handleChange("clientPhone", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Client's Address"
              value={invoice.clientAddress}
              onChange={(value) => handleChange("clientAddress", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="City, State Zip"
              value={invoice.clientAddress2}
              onChange={(value) => handleChange("clientAddress2", value)}
              pdfMode={pdfMode}
            />

            {/* <EditableSelect
              options={countryList}
              value={invoice.clientCountry}
              onChange={(value) => handleChange("clientCountry", value)}
              pdfMode={pdfMode}
            /> */}
          </View>
          <View className="w-45" pdfMode={pdfMode}>
            <View className="flex mb-5 mt-40" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceTitleLabel}
                  onChange={(value) => handleChange("invoiceTitleLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableInput
                  placeholder="INV-12"
                  value={invoice.invoiceTitle}
                  onChange={(value) => handleChange("invoiceTitle", value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDateLabel}
                  onChange={(value) => handleChange("invoiceDateLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDate, dateFormat)}
                  selected={invoiceDate}
                  onChange={(date) =>
                    handleChange(
                      "invoiceDate",
                      date && !Array.isArray(date)
                        ? format(date, dateFormat)
                        : ""
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            {/* <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDueDateLabel}
                  onChange={(value) =>
                    handleChange("invoiceDueDateLabel", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDueDate, dateFormat)}
                  selected={invoiceDueDate}
                  onChange={(date) =>
                    handleChange(
                      "invoiceDueDate",
                      date && !Array.isArray(date)
                        ? format(date, dateFormat)
                        : ""
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View> */}
          </View>
        </View>
        {/* client end */}
        {/* 
        <View className="flex mt-40" pdfMode={pdfMode}>
          <View className="w-55" pdfMode={pdfMode}>
            <EditableInput
              className="bold dark mb-5"
              value={invoice.billTo}
              onChange={(value) => handleChange("billTo", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Your Client's Name"
              value={invoice.clientName}
              onChange={(value) => handleChange("clientName", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Client's Address"
              value={invoice.clientAddress}
              onChange={(value) => handleChange("clientAddress", value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="City, State Zip"
              value={invoice.clientAddress2}
              onChange={(value) => handleChange("clientAddress2", value)}
              pdfMode={pdfMode}
            />
            <EditableSelect
              options={countryList}
              value={invoice.clientCountry}
              onChange={(value) => handleChange("clientCountry", value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-45" pdfMode={pdfMode}>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceTitleLabel}
                  onChange={(value) => handleChange("invoiceTitleLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableInput
                  placeholder="INV-12"
                  value={invoice.invoiceTitle}
                  onChange={(value) => handleChange("invoiceTitle", value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDateLabel}
                  onChange={(value) => handleChange("invoiceDateLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDate, dateFormat)}
                  selected={invoiceDate}
                  onChange={(date) =>
                    handleChange(
                      "invoiceDate",
                      date && !Array.isArray(date)
                        ? format(date, dateFormat)
                        : ""
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDueDateLabel}
                  onChange={(value) =>
                    handleChange("invoiceDueDateLabel", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDueDate, dateFormat)}
                  selected={invoiceDueDate}
                  onChange={(date) =>
                    handleChange(
                      "invoiceDueDate",
                      date && !Array.isArray(date)
                        ? format(date, dateFormat)
                        : ""
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
          </View>
        </View> */}

        <View className="mt-30 bg-dark flex" pdfMode={pdfMode}>
          <View className="w-8 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineNo}
              onChange={(value) => handleChange("productLineNo", value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineDescription}
              onChange={(value) =>
                handleChange("productLineDescription", value)
              }
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-9 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange("productLineQuantity", value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) =>
                handleChange("productLineQuantityRate", value)
              }
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) =>
                handleChange("productLineQuantityAmount", value)
              }
              pdfMode={pdfMode}
            />
          </View>
        </View>

        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === "" ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex" pdfMode={pdfMode}>
              <View className="w-8 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={`${i + parseInt(productLine.no)}`}
                  onChange={(value) => handleProductLineChange(i, "no", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableTextarea
                  className="dark"
                  rows={2}
                  placeholder="Enter item name/description"
                  value={productLine.description}
                  onChange={(value) =>
                    handleProductLineChange(i, "description", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-9 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) =>
                    handleProductLineChange(i, "quantity", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.rate}
                  onChange={(value) =>
                    handleProductLineChange(i, "rate", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {calculateAmount(productLine.quantity, productLine.rate)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          );
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Add Line Item
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange("subTotalLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {subTotal?.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.taxLabel}
                  onChange={(value) => handleChange("taxLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {saleTax?.toFixed(2)}
                </Text>
              </View>
            </View> */}

            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.deliveryChargeLabel}
                  onChange={(value) =>
                    handleChange("deliveryChargeLabel", value)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                {/* <Text className="right bold dark" pdfMode={pdfMode}>
                  {deliveryCharge?.toFixed(2)}
                </Text> */}
                <EditableInput
                  className="right bold dark"
                  // value={paidTotal && parseFloat(paidTotal)?.toFixed(2)}
                  value={deliveryCharge}
                  onChange={(value) => setDeliveryCharge(value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>

            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.paidLabel}
                  onChange={(value) => handleChange("paidLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                {/* <Text className="right bold dark" pdfMode={pdfMode}>
                  {paidTotal?.toFixed(2)}
                </Text> */}
                <EditableInput
                  className="right bold dark"
                  // value={paidTotal && parseFloat(paidTotal)?.toFixed(2)}
                  value={paidTotal}
                  onChange={(value) => setPaidTotal(value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange("totalLabel", value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange("currency", value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {(typeof subTotal !== "undefined" &&
                  typeof deliveryCharge !== "undefined" &&
                  typeof paidTotal !== "undefined"
                    ? subTotal +
                      parseFloat(deliveryCharge) -
                      parseFloat(paidTotal)
                    : 0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* signature start */}
        <View className="flex end mt-60" pdfMode={pdfMode}>
          <View className="w-40 p-4-8 pb-10" pdfMode={pdfMode}>
            <hr className="space-remove" />
            <Text
              className="fs-20 bold dark right space-remove w-93"
              pdfMode={pdfMode}
            >
              Authorizer Signature
            </Text>
          </View>
        </View>
        {/* signature end */}

        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.notesLabel}
            onChange={(value) => handleChange("notesLabel", value)}
            pdfMode={pdfMode}
          />
          {notes?.map((note, i) => (
            <div key={i} className="flex">
              <span style={{ paddingRight: "1rem" }}>
                {(indexOfNote = (1 + i).toString() + ".")}
              </span>
              <Text className="dark space-remove" pdfMode={pdfMode}>
                {note}
              </Text>
            </div>
          ))}
        </View>
        {/* <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange("termLabel", value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.term}
            onChange={(value) => handleChange("term", value)}
            pdfMode={pdfMode}
          />
        </View> */}
      </Page>
    </Document>
  );
};

export default InvoicePage;
