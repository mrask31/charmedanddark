// Simple test script to verify the narrative API works
const testInput = {
  item_name: 'Lunar Devotion Ring',
  item_type: 'jewelry',
  primary_symbol: 'moon',
  emotional_core: 'devotion',
  energy_tone: 'balanced_reverent',
  intended_use: 'worn_intentionally',
};

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/generate-narrative', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInput),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n=== Generated Narrative ===\n');
      console.log('SHORT DESCRIPTION:');
      console.log(data.data.short_description);
      console.log('\nLONG RITUAL DESCRIPTION:');
      console.log(data.data.long_ritual_description);
      console.log('\nRITUAL INTENTION PROMPT:');
      console.log(data.data.ritual_intention_prompt);
      console.log('\nCARE & USE NOTE:');
      console.log(data.data.care_use_note);
      console.log('\nALT TEXT:');
      console.log(data.data.alt_text);
      console.log('\nDROP TAGLINE:');
      console.log(data.data.one_line_drop_tagline);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
