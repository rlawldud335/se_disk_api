import sys
from win32com import client

DIR_PATH = "D:\\changyung1\\se_disk_api\\file\\"
DEST_DIR = "D:\\changyung1\\se_disk_api\\file\\pdf\\"

def ExcelToPdf(filename):
    try:
        excel = client.DispatchEx("Excel.Application")
        excel.Visible = 0
        wb = excel.Workbooks.Open(DIR_PATH +"xlsx\\" + filename + ".xlsx")
        wb.SaveAs(DEST_DIR+filename+'.pdf', 57)
    except Exception as e:
        print(e)
    finally:
        wb.Close()
        excel.Quit()


def DocToPdf(filename):
    try:
        word = client.Dispatch("Word.Application")
        doc = word.Documents.Open(DIR_PATH +"docx\\" + filename + ".docx")
        doc.SaveAs(DEST_DIR+filename+'.pdf', 17)
    except Exception as e:
        print(e)
    finally:
        doc.Close()
        word.Quit()


def HwpToPdf(filename):
    try:
        hwp = client.gencache.EnsureDispatch("HWPFrame.HwpObject")
        hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckerModuleExample")
        hwp.Open(DIR_PATH +"hwp\\" + filename + ".hwp")
        hwp.SaveAs(DEST_DIR+filename+'.pdf', "PDF")
    except Exception as e:
        print(e)
    finally:
        hwp.Quit()


def PptToPdf(filename):
    try:
        powerpoint = client.gencache.EnsureDispatch("PowerPoint.Application")
        ppt = powerpoint.Presentations.Open(DIR_PATH +"pptx\\" + filename + ".pptx", False, False, False)
        ppt.ExportAsFixedFormat(DEST_DIR+filename+'.pdf', 2, PrintRange=None)
    except Exception as e:
        print(e)
    finally:
        ppt.Close()
        powerpoint.Quit()


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Insufficient arguments")
        sys.exit()
    filename = sys.argv[1].split('.')[0]
    extension = sys.argv[1].split('.')[1]
    if extension == 'hwp':
        HwpToPdf(filename)
    elif extension == 'xlsx':
        ExcelToPdf(filename)
    elif extension == 'pptx':
        PptToPdf(filename)
    elif extension == 'docx':
        DocToPdf(filename)
    else:
        print("변환할 수 없는 확장자 입니다.")
