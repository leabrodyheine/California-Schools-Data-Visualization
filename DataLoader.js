/**
 * Asynchronously loads data from a specified CSV file, processes it, and returns the cleaned data.
 * The function applies a row converter to each row of the CSV to ensure data integrity and format consistency.
 * Rows with missing fields, incorrectly formatted data, or non-numeric values in numeric fields are skipped.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of objects, each representing a cleaned row from the CSV file.
 * Each object includes properties for TimePeriodStart (as a Date object), SchoolType, LearningModel, DistrictName, and EnrollmentTotal (as a number).
 */
async function loadData() {
    const dataPath = "data/California_Schools_LearningModelData_Final.csv";
    const rowConverter = (d) => {
        const EnrollmentTotal = parseInt(d.EnrollmentTotal, 10);

        const isInvalidRow = !d.TimePeriodStart || isNaN(new Date(d.TimePeriodStart)) ||
            !d.LearningModel || typeof d.LearningModel !== 'string' ||
            !d.SchoolType || typeof d.SchoolType !== 'string' ||
            !d.DistrictName || typeof d.DistrictName !== 'string' ||
            isNaN(EnrollmentTotal);

        if (isInvalidRow) {
            return null;
        }

        return {
            TimePeriodStart: new Date(d.TimePeriodStart),
            SchoolType: d.SchoolType.trim(),
            LearningModel: d.LearningModel.trim(),
            DistrictName: d.DistrictName.trim(),
            EnrollmentTotal: EnrollmentTotal
        };
    };
    let rawData = await d3.csv(dataPath, rowConverter);
    let cleanedData = rawData.filter(d => d);
    return cleanedData;
}

window.loadData = loadData;