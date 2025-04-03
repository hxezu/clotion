
//새페이지 생성
async function makeFile() {
  try {
    const response = await fetch('https://kdt-api.fe.dev-cos.com/documents', {
      method: 'POST',
      headers: {
        'x-username': 'test9999',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create document');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//문서 목록 데이터
async function fetchUserData() {
  try {
    const response = await fetch('https://kdt-api.fe.dev-cos.com/documents', {
      headers: {
        'x-username': 'test9999',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
   // console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//특정 id content 가져오기
async function fetchUserContent(documentId) {
  try {
    const response = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${documentId}`, {
      headers: {
        'x-username': 'test9999',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    //console.log(data);
    return data.content;
  } catch (error) {
    console.error(error);
    return [];
  }
}


  // id문서 갱신
  async function updateDocument(documentId, updatedData) {
    try {
      const response = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-username': 'test9999',
        },
        body: JSON.stringify(updatedData),
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }


export {makeFile, fetchUserData, updateDocument, fetchUserContent}