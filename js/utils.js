/**
 * HTML 템플릿을 비동기로 로드
 */
export async function fetchHtmlAsText(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.text();
  } catch (error) {
    console.error(`Error loading HTML from ${url}:`, error);
    return '<div class="page-container">페이지를 불러오는 중 오류가 발생했습니다.</div>';
  }
}
