export function brazilianDate(date) {
    const data = new Date(date);

    const addZeroLeft = value => value < 10 ? `0${value}` : value;

    const day = addZeroLeft(data.getDate() + 1);
    const month = addZeroLeft(data.getMonth() + 1);
    const year = data.getFullYear();
    
    const dateFormater = `${day}/${month}/${year}`;
    
    return dateFormater;
}