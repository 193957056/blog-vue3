import { createI18n } from 'vue-i18n'

const messages = {
  'zh-CN': {
    nav: { home: '首页', tech: '技术', design: '设计', about: '关于', links: '友链', search: '搜索文章...' },
    theme: { light: '浅色模式', dark: '深色模式' },
    post: { 
      readMore: '阅读全文', 
      views: '阅读', 
      minutes: '分钟',
      all: '全部',
      published: '已发布',
      draft: '草稿',
      newPost: '新建文章',
      noPosts: '暂无文章',
      createFirst: '创建第一篇文章',
      editPost: '编辑文章',
      createPost: '创建文章',
      title: '标题',
      content: '内容',
      excerpt: '摘要',
      cover: '封面图片',
      status: '状态',
      category: '分类',
      selectCategory: '选择分类',
      uncategorized: '未分类',
      startWriting: '开始写作...',
      deleteConfirm: '确定删除这篇文章吗？'
    },
    common: {
      loading: '加载中...',
      edit: '编辑',
      delete: '删除',
      cancel: '取消',
      save: '保存',
      saving: '保存中...'
    },
    footer: {
      tagline: '用文字记录思考，用设计诠释美学',
      navigation: '导航',
      about: '关于',
      contact: '联系',
      allRights: '保留所有权利'
    }
  },
  'en': {
    nav: { home: 'Home', tech: 'Tech', design: 'Design', about: 'About', links: 'Links', search: 'Search articles...' },
    theme: { light: 'Light', dark: 'Dark' },
    post: { 
      readMore: 'Read More', 
      views: 'views', 
      minutes: 'min',
      all: 'All',
      published: 'Published',
      draft: 'Draft',
      newPost: 'New Post',
      noPosts: 'No posts yet',
      createFirst: 'Create your first post',
      editPost: 'Edit Post',
      createPost: 'Create Post',
      title: 'Title',
      content: 'Content',
      excerpt: 'Excerpt',
      cover: 'Cover Image',
      status: 'Status',
      category: 'Category',
      selectCategory: 'Select Category',
      uncategorized: 'Uncategorized',
      startWriting: 'Start writing...',
      deleteConfirm: 'Are you sure you want to delete this post?'
    },
    common: {
      loading: 'Loading...',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...'
    },
    footer: {
      tagline: 'Record thoughts with words, interpret aesthetics with design',
      navigation: 'Navigation',
      about: 'About',
      contact: 'Contact',
      allRights: 'All rights reserved'
    }
  },
  'ja': {
    nav: { home: 'ホーム', tech: '技術', design: 'デザイン', about: '概要', links: 'リンク', search: '記事を検索...' },
    theme: { light: 'ライト', dark: 'ダーク' },
    post: { 
      readMore: '続きを読む', 
      views: '閲覧', 
      minutes: '分',
      all: 'すべて',
      published: '公開中',
      draft: '下書き',
      newPost: '新規記事',
      noPosts: '記事がありません',
      createFirst: '最初の記事を作成',
      editPost: '記事を編集',
      createPost: '記事を作成',
      title: 'タイトル',
      content: '内容',
      excerpt: '要約',
      cover: 'カバー画像',
      status: 'ステータス',
      category: 'カテゴリ',
      selectCategory: 'カテゴリを選択',
      uncategorized: '未分類',
      startWriting: '書き始める...',
      deleteConfirm: 'この記事を削除してもよろしいですか？'
    },
    common: {
      loading: '読み込み中...',
      edit: '編集',
      delete: '削除',
      cancel: 'キャンセル',
      save: '保存',
      saving: '保存中...'
    },
    footer: {
      tagline: '文字で考えを記録し、デザインで美学を表現',
      navigation: 'ナビゲーション',
      about: '概要',
      contact: 'お問い合わせ',
      allRights: '全著作権所有'
    }
  },
  'ko': {
    nav: { home: '홈', tech: '기술', design: '디자인', about: '정보', links: '링크', search: '글 검색...' },
    theme: { light: '라이트', dark: '다크' },
    post: { 
      readMore: '더 보기', 
      views: '조회', 
      minutes: '분',
      all: '전체',
      published: '발행됨',
      draft: '초안',
      newPost: '새 글',
      noPosts: '글이 없습니다',
      createFirst: '첫 번째 글 작성',
      editPost: '글 수정',
      createPost: '글 작성',
      title: '제목',
      content: '내용',
      excerpt: '요약',
      cover: '커버 이미지',
      status: '상태',
      category: '카테고리',
      selectCategory: '카테고리 선택',
      uncategorized: '미분류',
      startWriting: '작성을 시작하세요...',
      deleteConfirm: '이 글을 삭제하시겠습니까?'
    },
    common: {
      loading: '로딩 중...',
      edit: '수정',
      delete: '삭제',
      cancel: '취소',
      save: '저장',
      saving: '저장 중...'
    },
    footer: {
      tagline: '文字으로 생각을 기록하고, 디자인으로 미학을 표현',
      navigation: '네비게이션',
      about: '정보',
      contact: '연락처',
      allRights: '모든 권리 보유'
    }
  }
}

const savedLocale = localStorage.getItem('locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages
})

export default i18n
