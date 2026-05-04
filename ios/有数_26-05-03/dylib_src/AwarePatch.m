// AwarePatch v10 - 安全回退 + AddPreferencesItem 诊断
// = v8 (稳定) + 启动时 dump AddPreferencesItem / AddIdleItem / AddSoldItem 等数据 model 的 ObjC method list
// 不再伪造 SwiftPayProduct（会崩）

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#include <objc/runtime.h>
#include <objc/message.h>
#include <unistd.h>

#define PKG_TYPE_VALUE  ((int64_t)4)

static Class gMgrCls = Nil;
static long offIsBuy = -1, offPackageType = -1;

#pragma mark - SubscribeMgr getter/setter (v8 那套，稳定)
static BOOL hk_isBuy(id s, SEL _c) { return YES; }
typedef void (*SetBoolIMP)(id, SEL, BOOL);
static SetBoolIMP orig_setIsBuy = NULL;
static void hk_setIsBuy(id s, SEL _c, BOOL v) { if (orig_setIsBuy) orig_setIsBuy(s, _c, YES); }
static int64_t hk_packageType(id s, SEL _c) { return PKG_TYPE_VALUE; }
typedef void (*SetInt64IMP)(id, SEL, int64_t);
static SetInt64IMP orig_setPackageType = NULL;
static void hk_setPackageType(id s, SEL _c, int64_t v) { if (orig_setPackageType) orig_setPackageType(s, _c, PKG_TYPE_VALUE); }

static void forceIvars(id mgr) {
    if (!mgr) return;
    void *raw = (__bridge void *)mgr;
    if (offIsBuy >= 0) { BOOL *p = (BOOL *)((char *)raw + offIsBuy); *p = YES; }
    if (offPackageType >= 0) { int64_t *p = (int64_t *)((char *)raw + offPackageType); *p = PKG_TYPE_VALUE; }
}
typedef id (*InitIMP)(id, SEL);
static InitIMP orig_init = NULL;
static id hk_init(id s, SEL _c) {
    id ret = orig_init ? orig_init(s, _c) : s;
    if (ret) forceIvars(ret);
    return ret;
}

#pragma mark - 拦截付费墙 (v8 兜底)
static const char *kPaywallVCClasses[] = {
    "_TtC5Aware18PurchaseController",
    "_TtC5Aware19SubscribeController",
    NULL,
};
typedef void (*VoidIMP)(id, SEL);
static NSMutableDictionary<NSString *, NSValue *> *gOrigVDLs = nil;

static void killVC(UIViewController *vc) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (vc.presentingViewController) [vc dismissViewControllerAnimated:NO completion:nil];
        else if (vc.navigationController.viewControllers.count > 1) [vc.navigationController popViewControllerAnimated:NO];
        else if (vc.parentViewController) {
            [vc willMoveToParentViewController:nil];
            [vc.view removeFromSuperview];
            [vc removeFromParentViewController];
        } else if (vc.view.superview) [vc.view removeFromSuperview];
    });
}
static void hk_paywallVDL(UIViewController *self, SEL _cmd) {
    NSLog(@"[AwarePatch] BLOCKED %@", NSStringFromClass([self class]));
    NSValue *origv = gOrigVDLs[NSStringFromClass([self class])];
    if (origv) ((VoidIMP)origv.pointerValue)(self, _cmd);
    killVC(self);
}
static void installVDLHook(const char *cn) {
    Class c = objc_getClass(cn);
    if (!c) return;
    SEL sel = @selector(viewDidLoad);
    Method m = class_getInstanceMethod(c, sel);
    if (!m) return;
    if (!gOrigVDLs) gOrigVDLs = [NSMutableDictionary dictionary];
    gOrigVDLs[NSStringFromClass(c)] = [NSValue valueWithPointer:method_getImplementation(m)];
    method_setImplementation(m, (IMP)hk_paywallVDL);
}

#pragma mark - 诊断: dump 数据 model 的 ObjC method list
static void dumpClassMethods(const char *clsName) {
    Class c = objc_getClass(clsName);
    if (!c) { NSLog(@"[AwarePatch] DUMP %s: not found", clsName); return; }
    NSLog(@"[AwarePatch] === DUMP %s ===", clsName);
    unsigned int n = 0;
    Method *ms = class_copyMethodList(c, &n);
    NSLog(@"[AwarePatch]   instance methods: %u", n);
    for (unsigned i = 0; i < n; i++) {
        SEL sel = method_getName(ms[i]);
        char ret[16] = {0};
        method_getReturnType(ms[i], ret, sizeof(ret));
        int nargs = method_getNumberOfArguments(ms[i]);
        NSLog(@"[AwarePatch]     %s   ret=%s nargs=%d", sel_getName(sel), ret, nargs);
    }
    free(ms);
    unsigned int pn = 0;
    objc_property_t *props = class_copyPropertyList(c, &pn);
    NSLog(@"[AwarePatch]   properties: %u", pn);
    for (unsigned i = 0; i < pn; i++) {
        NSLog(@"[AwarePatch]     @ %s = %s", property_getName(props[i]), property_getAttributes(props[i]));
    }
    free(props);
}

#pragma mark - entrypoint
__attribute__((constructor))
static void AwarePatch_init(void) {
    @autoreleasepool {
        NSLog(@"[AwarePatch] === v10 安全 + 数据model 诊断 loaded === pid=%d", getpid());

        gMgrCls = objc_getClass("Aware.SubscribeMgr");
        if (gMgrCls) {
            Ivar v;
            v = class_getInstanceVariable(gMgrCls, "isBuy");       if (v) offIsBuy = ivar_getOffset(v);
            v = class_getInstanceVariable(gMgrCls, "packageType"); if (v) offPackageType = ivar_getOffset(v);

            Method m;
            m = class_getInstanceMethod(gMgrCls, sel_registerName("isBuy"));
            if (m) method_setImplementation(m, (IMP)hk_isBuy);
            m = class_getInstanceMethod(gMgrCls, sel_registerName("setIsBuy:"));
            if (m) { orig_setIsBuy = (SetBoolIMP)method_getImplementation(m); method_setImplementation(m, (IMP)hk_setIsBuy); }
            m = class_getInstanceMethod(gMgrCls, sel_registerName("packageType"));
            if (m) method_setImplementation(m, (IMP)hk_packageType);
            m = class_getInstanceMethod(gMgrCls, sel_registerName("setPackageType:"));
            if (m) { orig_setPackageType = (SetInt64IMP)method_getImplementation(m); method_setImplementation(m, (IMP)hk_setPackageType); }
            m = class_getInstanceMethod(gMgrCls, sel_registerName("init"));
            if (m) { orig_init = (InitIMP)method_getImplementation(m); method_setImplementation(m, (IMP)hk_init); }
            NSLog(@"[AwarePatch] SubscribeMgr hooks installed");
        }

        for (int i = 0; kPaywallVCClasses[i]; i++) installVDLHook(kPaywallVCClasses[i]);

        // 诊断：dump 几个关键 data model 的 ObjC 方法表
        const char *toDump[] = {
            "_TtC5Aware18AddPreferencesItem",
            "_TtC5Aware18AddPreferencesCell",
            "_TtC5Aware11AddIdleItem",
            "_TtC5Aware11AddSoldItem",
            "_TtC5Aware10AddTagItem",
            "_TtC5Aware11AddNoteItem",
            "_TtC5Aware13AddTargetItem",
            "_TtC5Aware12AddStateItem",
            "_TtC5Aware15SwiftPayProduct",  // 也 dump 它，看构造方式
            NULL,
        };
        for (int i = 0; toDump[i]; i++) dumpClassMethods(toDump[i]);

        NSLog(@"[AwarePatch] === v10 setup done ===");

        NSArray *dirs = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        if (dirs.count) {
            NSString *p = [dirs[0] stringByAppendingPathComponent:@"AwarePatch.log"];
            NSString *s = [NSString stringWithFormat:@"v10 loaded at %@\n", [NSDate date]];
            [s writeToFile:p atomically:YES encoding:NSUTF8StringEncoding error:NULL];
        }
    }
}
