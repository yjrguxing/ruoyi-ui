import useTagsViewStore from '@/store/modules/tagsView'
import router from '@/router'

export default {
  // 現在のタブページのチェックを更新
  refreshPage(obj) {
    const { path, query, matched } = router.currentRoute.value;
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query };
          }
        }
      });
    }
    return useTagsViewStore().delCachedView(obj).then(() => {
      const { path, query } = obj
      router.replace({
        path: '/redirect' + path,
        query: query
      })
    })
  },
  // 現在のタブページのチェックを閉じて、新しいページのチェックを開きます
  closeOpenPage(obj) {
    useTagsViewStore().delView(router.currentRoute.value);
    if (obj !== undefined) {
      return router.push(obj);
    }
  },
  // 指定されたタブページのチェックをオフにする
  closePage(obj) {
    if (obj === undefined) {
      return useTagsViewStore().delView(router.currentRoute.value).then(({ visitedViews }) => {
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          return router.push(latestView.fullPath)
        }
        return router.push('/');
      });
    }
    return useTagsViewStore().delView(obj);
  },
  // すべてのタブページのチェックをオフにする
  closeAllPage() {
    return useTagsViewStore().delAllViews();
  },
  // 左タブページのチェックをオフにする
  closeLeftPage(obj) {
    return useTagsViewStore().delLeftTags(obj || router.currentRoute.value);
  },
  // 右側のタブページのチェックをオフにする
  closeRightPage(obj) {
    return useTagsViewStore().delRightTags(obj || router.currentRoute.value);
  },
  // 他のタブページのチェックをオフにする
  closeOtherPage(obj) {
    return useTagsViewStore().delOthersViews(obj || router.currentRoute.value);
  },
  // タブページを開く
  openPage(url) {
    return router.push(url);
  },
  // タブページラベルの修正
  updatePage(obj) {
    return useTagsViewStore().updateVisitedView(obj);
  }
}
