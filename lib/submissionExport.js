import { format, isValid } from 'date-fns';

// Safe date formatting function
const safeFormatDate = (dateString, formatString = 'yyyy-MM-dd HH:mm') => {
    if (!dateString) return 'Unknown';

    try {
        const date = new Date(dateString);
        if (isValid(date)) {
            return format(date, formatString);
        }
        return 'Invalid Date';
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Date Error';
    }
};

// Helper function to get submission type
const getSubmissionType = (submission) => {
    if (submission.actual_yield_tons_per_ha) return "Yield Data";
    if (submission.predicted_yield) return "Prediction";
    return "Unknown";
};

// Helper function to get submission value
const getSubmissionValue = (submission) => {
    if (submission.actual_yield_tons_per_ha) return `${submission.actual_yield_tons_per_ha}`;
    if (submission.predicted_yield) return `${submission.predicted_yield}`;
    return "N/A";
};

// Main export function for submissions
export const downloadSubmissionsCSV = (submissions, filename = null) => {
    if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
        alert('No submission data available to export.');
        return;
    }

    const headers = [
        "Submission Type", 
        "District", 
        "Yield Value (t/ha)", 
        "Rainfall (mm)", 
        "Temperature (°C)", 
        "Soil pH", 
        "Fertilizer Used (kg/ha)", 
        "Pesticide Used (l/ha)", 
        "Irrigation Type", 
        "Submission Date"
    ];
    
    const rows = submissions.map(sub => {
        // Extract the actual data from the submission object
        return [
            getSubmissionType(sub),
            sub.district || "Unknown",
            getSubmissionValue(sub),
            sub.rainfall_mm || 'N/A',
            sub.temperature_c || 'N/A',
            sub.soil_ph || 'N/A',
            sub.fertilizer_used_kg_per_ha || 'N/A',
            sub.pesticide_l_per_ha || 'N/A',
            sub.irrigation_type || 'N/A',
            safeFormatDate(sub.created_at || sub.submission_date || sub.timestamp)
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(","))
        .join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileDate = format(new Date(), 'yyyy-MM-dd');
    const downloadFilename = filename || `smartgwiza-submissions-${fileDate}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", downloadFilename);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Export filtered submissions based on criteria
export const downloadFilteredSubmissionsCSV = (submissions, filters = {}) => {
    let filteredSubmissions = [...submissions];

    // Apply filters
    if (filters.submissionType && filters.submissionType !== 'all') {
        filteredSubmissions = filteredSubmissions.filter(sub => {
            if (filters.submissionType === 'yield') {
                return sub.actual_yield_tons_per_ha;
            } else if (filters.submissionType === 'prediction') {
                return sub.predicted_yield;
            }
            return true;
        });
    }

    if (filters.district && filters.district !== 'all') {
        filteredSubmissions = filteredSubmissions.filter(sub => 
            sub.district?.toLowerCase() === filters.district.toLowerCase()
        );
    }

    if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        filteredSubmissions = filteredSubmissions.filter(sub => {
            const subDate = new Date(sub.created_at || sub.submission_date);
            return subDate >= start && subDate <= end;
        });
    }

    if (filteredSubmissions.length === 0) {
        alert('No submissions match the selected filters.');
        return;
    }

    const filename = `smartgwiza-submissions-filtered-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadSubmissionsCSV(filteredSubmissions, filename);
};

// Export submissions statistics
export const downloadSubmissionsStatsCSV = (submissions, stats) => {
    const statsData = [
        ["Submissions Statistics Report", "", "", ""],
        ["Generated on:", format(new Date(), 'yyyy-MM-dd HH:mm'), "", ""],
        ["", "", "", ""],
        ["Overall Statistics", "", "", ""],
        ["Total Submissions", stats.total_submissions || submissions.length, "", ""],
        ["Yield Data Submissions", submissions.filter(s => s.actual_yield_tons_per_ha).length, "", ""],
        ["Prediction Submissions", submissions.filter(s => s.predicted_yield).length, "", ""],
        ["Average Yield", `${stats.average_yield || 0} t/ha`, "", ""],
        ["", "", "", ""],
        ["Regional Distribution", "", "", ""],
        ["District", "Submissions", "Avg Yield", "Farmers"],
    ];

    // Calculate district statistics
    const districtStats = submissions.reduce((acc, sub) => {
        const district = sub.district || 'Unknown';
        if (!acc[district]) {
            acc[district] = {
                count: 0,
                totalYield: 0,
                farmers: new Set()
            };
        }
        acc[district].count++;
        const yieldValue = sub.actual_yield_tons_per_ha || sub.predicted_yield || 0;
        acc[district].totalYield += parseFloat(yieldValue);
        if (sub.user_name) acc[district].farmers.add(sub.user_name);
        return acc;
    }, {});

    Object.entries(districtStats).forEach(([district, data]) => {
        const avgYield = data.count > 0 ? (data.totalYield / data.count).toFixed(2) : '0.00';
        statsData.push([district, data.count, `${avgYield} t/ha`, data.farmers.size]);
    });

    const csvContent = statsData.map(row => 
        row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smartgwiza-submissions-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};