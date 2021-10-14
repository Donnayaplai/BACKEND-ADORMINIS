require("Sequelize");
const dormModel = require('../models/dorm');
const settingModel = require('../models/setting');
const buildingModel = require('../models/building');

const getOldCostSettingDetail = async (settingID) => {
    const oldDetail = await settingModel.findOne({
        attributes: ['WATERPRICE',
            'ELECTRICITYPRICE',
            'MINWATERUNIT',
            'MINWATERPRICE',
            'GUARANTEEFEE',
            'MULTPREPAID',
            'MAINTENANCEFEE',
            'PARKINGFEE',
            'INTERNETFEE',
            'CLEANINGFEE',
            'OTHER'],
        where: {
            SETTINGID: settingID,
        },
    });
    return oldDetail.dataValues;
};

const getCostSettingByDormID = async (req, res) => {
    const { dormID } = req.params;

    const settingID = await settingModel.findOne({
        attributes: ['SETTINGID'],
        where: {
            DORMID: dormID
        }
    });
    const costSetting = await getOldCostSettingDetail(settingID.dataValues.SETTINGID)
    return res.status(200).send(costSetting);
};

const uocCostSetting = async (req, res) => {
    const { dormID } = req.params;

    const {
        waterPrice,
        electricityPrice,
        minWaterUnit,
        minWaterPrice,
        guaranteeFee,
        multPrePaid,
        maintenanceFee,
        parkingFee,
        internetFee,
        cleaningFee,
        other,
    } = req.body;

    const isSetting = await settingModel.findOne({
        attributes: ['SETTINGID'],
        where: {
            DORMID: dormID
        }
    });

    if (!isSetting) {

        const costDetail = {
            WATERPRICE: waterPrice ? waterPrice : 0,
            ELECTRICITYPRICE: electricityPrice ? electricityPrice : 0,
            MINWATERUNIT: minWaterUnit ? minWaterUnit : 0,
            MINWATERPRICE: minWaterPrice ? minWaterPrice : 0,
            GUARANTEEFEE: guaranteeFee ? guaranteeFee : 0,
            MULTPREPAID: multPrePaid ? multPrePaid : 0,
            MAINTENANCEFEE: maintenanceFee ? maintenanceFee : 0,
            PARKINGFEE: parkingFee ? parkingFee : 0,
            INTERNETFEE: internetFee ? internetFee : 0,
            CLEANINGFEE: cleaningFee ? cleaningFee : 0,
            OTHER: other ? other : 0,
            DORMID: dormID,
        }
        // Create new drom
        const setting = await settingModel.create(costDetail)

        return res.status(200).send({ setting, created: true });

    } else {

        const settingID = isSetting.dataValues.SETTINGID;

        const oldCostSettingDetail = await getOldCostSettingDetail(settingID);

        const costDetail = {
            WATERPRICE: waterPrice ? waterPrice : oldCostSettingDetail.WATERPRICE,
            ELECTRICITYPRICE: electricityPrice ? electricityPrice : oldCostSettingDetail.ELECTRICITYPRICE,
            MINWATERUNIT: minWaterUnit ? minWaterUnit : oldCostSettingDetail.MINWATERUNIT,
            MINWATERPRICE: minWaterPrice ? minWaterPrice : oldCostSettingDetail.MINWATERPRICE,
            GUARANTEEFEE: guaranteeFee ? guaranteeFee : oldCostSettingDetail.GUARANTEEFEE,
            MULTPREPAID: multPrePaid ? multPrePaid : oldCostSettingDetail.MULTPREPAID,
            MAINTENANCEFEE: maintenanceFee ? maintenanceFee : oldCostSettingDetail.MAINTENANCEFEE,
            PARKINGFEE: parkingFee ? parkingFee : oldCostSettingDetail.PARKINGFEE,
            INTERNETFEE: internetFee ? internetFee : oldCostSettingDetail.INTERNETFEE,
            CLEANINGFEE: cleaningFee ? cleaningFee : oldCostSettingDetail.CLEANINGFEE,
            OTHER: other ? other : oldCostSettingDetail.OTHER,
        }
        // Update drom
        const setting = await settingModel.update(costDetail, {
            where: {
                DORMID: dormID
            }
        });

        return res.status(200).send({ setting, created: false });
    }
};

const getBuildingsByDormID = async (req, res) => {
    const { dormID } = req.params;

    const buildings = await buildingModel.findAll({
        where: {
            DORMID: dormID,
        },
    });
    let arrayBuilding = []
    for (let i = 0; i < buildings.length; i++) {
        arrayBuilding.push(buildings[i].dataValues)
    }
    return res.status(200).send(arrayBuilding);
};


const uocBuildings = async (req, res) => {
    const { dormID } = req.params;
    const { arrayBuilding } = req.body;

    for (let i = 0; i < arrayBuilding.length; i++) {
        const building = {
            BUILDINGID: arrayBuilding[i].BUILDINGID ? arrayBuilding[i].BUILDINGID : null,
            BUILDINGNAME: arrayBuilding[i].BUILDINGNAME,
            NUMOFFLOOR: arrayBuilding[i].NUMOFFLOOR,
            DORMID: dormID
        }

        const isBuilding = await buildingModel.findOne({
            where: {
                BUILDINGID: building.BUILDINGID,
                DORMID: dormID
            }
        });

        if (!isBuilding) {

            const data = await buildingModel.create(building)
            return res.status(200).send({ data, created: true });


        } else {
            const data = await buildingModel.update(building, {
                where: {
                    BUILDINGID: building.BUILDINGID
                }
            });
            return res.status(200).send({ data, created: false });

        }
    }
};

const updateDormInfo = async (req, res) => {
    const { dormID } = req.params;
    const {
        dormNameTH,
        dormNameENG,
        address,
        province,
        street,
        postCode,
        telNo,
        subdistrict,
        district
    } = req.body;

    const dormInfo = {
        DORMNAMETH: dormNameTH ? dormNameTH : null,
        DORMNAMEENG: dormNameENG ? dormNameENG : null,
        ADDRESS: address ? address : null,
        PROVINCE: province ? province : null,
        STREET: street ? street : null,
        POSTCODE: postCode ? postCode : null,
        TELNO: telNo ? telNo : null,
        SUBDISTRICT: subdistrict ? subdistrict : null,
        DISTRICT: district ? district : null,
    };

    dormModel.update(dormInfo, {
        where: {
            DORMID: dormID
        }
    })
        .then(data => {
            res.status(200).send(data);
            console.log("Info updated!!");
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message
            });
        });
};

module.exports = { getCostSettingByDormID, uocCostSetting, getBuildingsByDormID, uocBuildings, updateDormInfo };
