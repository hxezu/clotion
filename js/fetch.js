
//새페이지 생성
async function makeFile() {
  try {
    const response = await fetch('https://kdt-api.fe.dev-cos.com/documents', {
      method: 'POST',
      headers: {
        'x-username': 'clotion',
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

//하위 Document 생성
async function makeSubdocument(documentId) {
  try {
    console.log("생성 요청 parent ID:", documentId); 
    const response = await fetch('https://kdt-api.fe.dev-cos.com/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-username': 'clotion',
      },
      body: JSON.stringify({ "parent": documentId }) 
    
    });
    console.log(documentId)

    if (!response.ok) {
      throw new Error('Failed to create Subdocument');
    }

    const data = await response.json();
    console.log(" 응답 받은 데이터:", data);
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
        'x-username': 'clotion',
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
        'x-username': 'clotion',
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
          'x-username': 'clotion',
        },
        body: JSON.stringify(updatedData),
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }


    //id문서 삭제
    async function deleteDocument(documentId) {
      try {
        const response = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${documentId}`, {
          method: 'DELETE',
          headers: {
            'x-username': 'clotion',
          },
        });
      } catch (error) {
        console.error(error);
      }
    }

    //특정 id data 가져오기
async function fetchUserIdData(documentId) {
  try {
    const response = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${documentId}`, {
      headers: {
        'x-username': 'clotion',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    //console.log(data);
    return data
  } catch (error) {
    console.error(error);
    return [];
  }
}

export {makeFile, fetchUserData, updateDocument, fetchUserContent,deleteDocument, makeSubdocument, fetchUserIdData}