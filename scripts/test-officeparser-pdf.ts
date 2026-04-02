import { parseOffice } from 'officeparser';
import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';

const buf = readFileSync('g:/code/brandonkorous/resume/Resume.pdf');

async function main() {
    // officeparser output
    console.log('=== OFFICEPARSER ===');
    const ast = await parseOffice(buf, { outputErrorToConsole: false });
    const opText = ast.toText();
    console.log('Length:', opText.length);
    console.log('First 2000 chars:');
    console.log(opText.substring(0, 2000));
    console.log('\n...\n');
    console.log('Last 1000 chars:');
    console.log(opText.substring(opText.length - 1000));

    console.log('\n\n=== PDF-PARSE ===');
    const ppResult = await pdfParse(buf);
    console.log('Length:', ppResult.text.length);
    console.log('First 2000 chars:');
    console.log(ppResult.text.substring(0, 2000));
}

main().catch(e => console.error(e));
